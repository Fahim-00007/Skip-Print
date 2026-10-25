"""
PDF Generation & Preview router.
Orchestrates Excel conversion, template background composition, signature placement,
live high-res preview generation, and final PDF export with tracking.
"""
import os
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from fastapi.responses import FileResponse
from backend.database import get_db
from backend.models import RenderPreviewRequest, RenderGenerateRequest, BillItem
from backend.services.excel_converter import convert_excel_to_pdf
from backend.services.pdf_composer import compose_document, render_page_preview_data_url
from backend.paths import OUTPUTS_DIR, SAMPLES_DIR, UPLOADS_DIR

router = APIRouter(prefix="/api/render", tags=["Generator"])

def find_excel_file(excel_file_id: str):
    if excel_file_id == "sample-invoice":
        sample_path = os.path.join(UPLOADS_DIR, "sample-invoice_sample_invoice.xlsx")
        if os.path.exists(sample_path):
            return sample_path, "sample_invoice.xlsx"
        orig_sample = os.path.join(SAMPLES_DIR, "sample_invoice.xlsx")
        if os.path.exists(orig_sample):
            return orig_sample, "sample_invoice.xlsx"

    for fname in os.listdir(UPLOADS_DIR):
        if fname.startswith(excel_file_id):
            p = os.path.join(UPLOADS_DIR, fname)
            orig_name = fname.split("_", 1)[1] if "_" in fname else fname
            return p, orig_name
    return None, None

def get_template_file(template_id: str):
    conn = get_db()
    cursor = conn.cursor()
    if template_id:
        cursor.execute("SELECT file_path, margin_top, margin_bottom, margin_left, margin_right, paper_size, orientation, name FROM templates WHERE id = ?", (template_id,))
    else:
        cursor.execute("SELECT file_path, margin_top, margin_bottom, margin_left, margin_right, paper_size, orientation, name FROM templates WHERE is_default = 1")
    row = cursor.fetchone()
    conn.close()
    return row

def get_signature_file(signature_id: str):
    if not signature_id:
        return None
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT file_path FROM signatures WHERE id = ?", (signature_id,))
    row = cursor.fetchone()
    conn.close()
    return row["file_path"] if row else None

def prepare_bill_raw_pdfs(bills, single_file_id, single_sheet):
    items = []
    if bills and len(bills) > 0:
        items = bills
    elif single_file_id:
        items = [BillItem(excel_file_id=single_file_id, sheet_name=single_sheet)]
    else:
        raise HTTPException(status_code=400, detail="No Excel bill file specified.")

    raw_pdf_paths = []
    engine_name = "Native Excel Vector Engine"
    warnings = []
    file_names = []
    first_excel_path = None

    for item in items:
        excel_path, orig_name = find_excel_file(item.excel_file_id)
        if not excel_path:
            raise HTTPException(status_code=404, detail=f"Excel file not found: {item.excel_file_id}")

        if not first_excel_path:
            first_excel_path = excel_path

        display_name = orig_name or item.excel_file_id
        if item.sheet_name:
            file_names.append(f"{display_name} ({item.sheet_name})")
        else:
            file_names.append(display_name)

        raw_pdf_name = f"raw_{item.excel_file_id}_{item.sheet_name or 'active'}.pdf"
        raw_pdf_path = os.path.join(OUTPUTS_DIR, raw_pdf_name)

        if not os.path.exists(raw_pdf_path) or os.path.getsize(raw_pdf_path) == 0:
            conv_res = convert_excel_to_pdf(excel_path, raw_pdf_path, sheet_name=item.sheet_name)
            if conv_res.get("warning"):
                warnings.append(conv_res["warning"])
            engine_name = conv_res.get("engine", engine_name)

        raw_pdf_paths.append(raw_pdf_path)

    return items, raw_pdf_paths, engine_name, ("; ".join(warnings) if warnings else None), file_names, first_excel_path

@router.post("/preview")
async def generate_preview(req: RenderPreviewRequest):
    items, raw_pdf_paths, engine, warning, file_names, _ = prepare_bill_raw_pdfs(
        req.bills, req.excel_file_id, req.sheet_name
    )

    # 2. Template details
    template_row = get_template_file(req.template_id)
    template_path = template_row["file_path"] if template_row else None

    # 3. Signature details
    sig_path = None
    sig_coords = None
    sig_page = "last"
    if req.signature and req.signature.signature_id:
        sig_path = get_signature_file(req.signature.signature_id)
        sig_coords = {
            "x": req.signature.x,
            "y": req.signature.y,
            "width": req.signature.width,
            "height": req.signature.height,
            "opacity": req.signature.opacity,
            "rotation": req.signature.rotation
        }
        sig_page = req.signature.page

    # 4. Compose temporary preview PDF (with hash of items to ensure distinct caching)
    cache_tag = "_".join(f"{b.excel_file_id[:8]}_{b.sheet_name or 'act'}" for b in items)
    preview_pdf_name = f"preview_{cache_tag[:60]}.pdf"
    preview_pdf_path = os.path.join(OUTPUTS_DIR, preview_pdf_name)

    comp_res = compose_document(
        bill_pdf_paths=raw_pdf_paths,
        template_path=template_path,
        output_pdf_path=preview_pdf_path,
        layout_mode=req.layout.layout_mode,
        paper_size=req.layout.paper_size,
        orientation=req.layout.orientation,
        margin_top=req.layout.margin_top,
        margin_bottom=req.layout.margin_bottom,
        margin_left=req.layout.margin_left,
        margin_right=req.layout.margin_right,
        scale_factor=req.layout.scale_factor,
        offset_x=req.layout.offset_x,
        offset_y=req.layout.offset_y,
        repeat_letterhead=req.layout.repeat_letterhead,
        signature_path=sig_path,
        signature_page=sig_page,
        signature_coords=sig_coords,
        annotations=req.annotations,
        blocks=req.layout.blocks
    )

    # 5. Render requested page to data URL
    data_url = render_page_preview_data_url(preview_pdf_path, page_number=req.preview_page, dpi=115)

    return {
        "success": True,
        "total_pages": comp_res["total_pages"],
        "current_page": req.preview_page,
        "preview_data_url": data_url,
        "engine": engine,
        "warning": warning
    }

@router.post("/generate")
async def generate_final_pdf(req: RenderGenerateRequest):
    items, raw_pdf_paths, engine, warning, file_names, first_excel_path = prepare_bill_raw_pdfs(
        req.bills, req.excel_file_id, req.sheet_name
    )

    template_row = get_template_file(req.template_id)
    template_path = template_row["file_path"] if template_row else None
    template_name = template_row["name"] if template_row else "Default Letterhead"

    sig_path = None
    sig_coords = None
    sig_page = "last"
    if req.signature and req.signature.signature_id:
        sig_path = get_signature_file(req.signature.signature_id)
        sig_coords = {
            "x": req.signature.x,
            "y": req.signature.y,
            "width": req.signature.width,
            "height": req.signature.height,
            "opacity": req.signature.opacity,
            "rotation": req.signature.rotation
        }
        sig_page = req.signature.page

    # Target output file
    gen_id = str(uuid.uuid4())
    if req.custom_filename:
        output_filename = f"{req.custom_filename}.pdf" if not req.custom_filename.lower().endswith(".pdf") else req.custom_filename
    elif len(items) > 1:
        output_filename = f"Combined_{len(items)}_Bills.pdf"
    else:
        raw_first = file_names[0].split(" (")[0]
        base_name = os.path.splitext(raw_first)[0]
        output_filename = f"{base_name}.pdf"

    stored_output_name = f"{gen_id}_{output_filename}"
    output_pdf_path = os.path.join(OUTPUTS_DIR, stored_output_name)

    comp_res = compose_document(
        bill_pdf_paths=raw_pdf_paths,
        template_path=template_path,
        output_pdf_path=output_pdf_path,
        layout_mode=req.layout.layout_mode,
        paper_size=req.layout.paper_size,
        orientation=req.layout.orientation,
        margin_top=req.layout.margin_top,
        margin_bottom=req.layout.margin_bottom,
        margin_left=req.layout.margin_left,
        margin_right=req.layout.margin_right,
        scale_factor=req.layout.scale_factor,
        offset_x=req.layout.offset_x,
        offset_y=req.layout.offset_y,
        repeat_letterhead=req.layout.repeat_letterhead,
        signature_path=sig_path,
        signature_page=sig_page,
        signature_coords=sig_coords,
        annotations=req.annotations,
        blocks=req.layout.blocks
    )

    file_size = os.path.getsize(output_pdf_path)
    combined_desc = ", ".join(file_names) if len(file_names) <= 3 else f"{len(file_names)} Bills: {', '.join(file_names[:2])}..."

    # Save to recent_files in DB
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO recent_files (id, excel_filename, excel_file_path, output_pdf_filename, output_pdf_path,
                             template_name, template_id, page_count, file_size, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (gen_id, combined_desc, first_excel_path or "", output_filename, output_pdf_path,
          template_name, req.template_id, comp_res["total_pages"], file_size, datetime.now().isoformat()))
    conn.commit()
    conn.close()

    return {
        "id": gen_id,
        "filename": output_filename,
        "download_url": f"/api/render/download/{gen_id}",
        "view_url": f"/api/render/view/{gen_id}",
        "page_count": comp_res["total_pages"],
        "file_size": file_size,
        "created_at": datetime.now().isoformat()
    }

@router.get("/download/{gen_id}")
async def download_pdf(gen_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT output_pdf_filename, output_pdf_path FROM recent_files WHERE id = ?", (gen_id,))
    row = cursor.fetchone()
    conn.close()

    if not row or not os.path.exists(row["output_pdf_path"]):
        raise HTTPException(status_code=404, detail="Generated file not found.")

    return FileResponse(
        row["output_pdf_path"],
        media_type="application/pdf",
        filename=row["output_pdf_filename"],
        headers={"Content-Disposition": f'attachment; filename="{row["output_pdf_filename"]}"'}
    )

@router.get("/view/{gen_id}")
async def view_pdf(gen_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT output_pdf_filename, output_pdf_path FROM recent_files WHERE id = ?", (gen_id,))
    row = cursor.fetchone()
    conn.close()

    if not row or not os.path.exists(row["output_pdf_path"]):
        raise HTTPException(status_code=404, detail="Generated file not found.")

    return FileResponse(
        row["output_pdf_path"],
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{row["output_pdf_filename"]}"'}
    )
