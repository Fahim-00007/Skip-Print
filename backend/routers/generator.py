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
from backend.models import RenderPreviewRequest, RenderGenerateRequest
from backend.services.excel_converter import convert_excel_to_pdf
from backend.services.pdf_composer import compose_document, render_page_preview_data_url

router = APIRouter(prefix="/api/render", tags=["Generator"])

UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "storage", "uploads")
OUTPUTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "storage", "outputs")
SAMPLES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "samples")
os.makedirs(OUTPUTS_DIR, exist_ok=True)

def find_excel_file(excel_file_id: str):
    if excel_file_id == "sample-invoice":
        sample_path = os.path.join(SAMPLES_DIR, "sample_invoice.xlsx")
        if os.path.exists(sample_path):
            return sample_path, "sample_invoice.xlsx"

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

@router.post("/preview")
async def generate_preview(req: RenderPreviewRequest):
    excel_path, orig_name = find_excel_file(req.excel_file_id)
    if not excel_path:
        raise HTTPException(status_code=404, detail="Excel file not found.")

    # 1. Convert Excel sheet to temporary raw PDF
    raw_pdf_name = f"raw_{req.excel_file_id}_{req.sheet_name or 'active'}.pdf"
    raw_pdf_path = os.path.join(OUTPUTS_DIR, raw_pdf_name)

    conv_res = convert_excel_to_pdf(excel_path, raw_pdf_path, sheet_name=req.sheet_name)

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

    # 4. Compose temporary preview PDF
    preview_pdf_name = f"preview_{req.excel_file_id}.pdf"
    preview_pdf_path = os.path.join(OUTPUTS_DIR, preview_pdf_name)

    comp_res = compose_document(
        bill_pdf_path=raw_pdf_path,
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
        annotations=req.annotations
    )

    # 5. Render requested page to data URL
    data_url = render_page_preview_data_url(preview_pdf_path, page_number=req.preview_page)

    return {
        "success": True,
        "total_pages": comp_res["total_pages"],
        "current_page": req.preview_page,
        "preview_data_url": data_url,
        "engine": conv_res.get("engine"),
        "warning": conv_res.get("warning")
    }

@router.post("/generate")
async def generate_final_pdf(req: RenderGenerateRequest):
    excel_path, orig_name = find_excel_file(req.excel_file_id)
    if not excel_path:
        raise HTTPException(status_code=404, detail="Excel file not found.")

    raw_pdf_name = f"raw_{req.excel_file_id}_{req.sheet_name or 'active'}.pdf"
    raw_pdf_path = os.path.join(OUTPUTS_DIR, raw_pdf_name)

    conv_res = convert_excel_to_pdf(excel_path, raw_pdf_path, sheet_name=req.sheet_name)

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
    base_name = os.path.splitext(orig_name)[0]
    output_filename = f"{req.custom_filename}.pdf" if req.custom_filename else f"{base_name}.pdf"
    stored_output_name = f"{gen_id}_{output_filename}"
    output_pdf_path = os.path.join(OUTPUTS_DIR, stored_output_name)

    comp_res = compose_document(
        bill_pdf_path=raw_pdf_path,
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
        annotations=req.annotations
    )

    file_size = os.path.getsize(output_pdf_path)

    # Save to recent_files in DB
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO recent_files (id, excel_filename, excel_file_path, output_pdf_filename, output_pdf_path,
                             template_name, template_id, page_count, file_size, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (gen_id, orig_name, excel_path, output_filename, output_pdf_path,
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
