"""
Company Letterhead Template Manager router.
Supports uploading PDFs/images, visual template builder, margin editing, duplicate, and delete.
"""
import os
import shutil
import uuid
import json
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
from fastapi.responses import FileResponse
from backend.database import get_db
from backend.models import CustomTemplateBuildRequest, TemplateUpdateMarginsRequest
from backend.services.template_renderer import render_custom_template_pdf, generate_preview_image
from backend.paths import TEMPLATES_DIR

router = APIRouter(prefix="/api/templates", tags=["Templates"])

@router.get("")
async def list_templates():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, name, type, file_path, paper_size, orientation,
           margin_top, margin_bottom, margin_left, margin_right,
           config_json, preview_image_path, is_default, created_at
    FROM templates
    ORDER BY is_default DESC, created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    templates = []
    for r in rows:
        t_id = r["id"]
        # Ensure preview image exists
        preview_path = r["preview_image_path"]
        file_path = r["file_path"]

        if (not preview_path or not os.path.exists(preview_path)) and file_path and os.path.exists(file_path):
            try:
                gen_preview = os.path.join(TEMPLATES_DIR, f"{t_id}_preview.png")
                generate_preview_image(file_path, gen_preview)
                preview_path = gen_preview
                # Update DB
                c2 = get_db()
                c2.execute("UPDATE templates SET preview_image_path = ? WHERE id = ?", (gen_preview, t_id))
                c2.commit()
                c2.close()
            except Exception as e:
                print(f"Could not generate preview for {t_id}:", e)

        templates.append({
            "id": r["id"],
            "name": r["name"],
            "type": r["type"],
            "paper_size": r["paper_size"],
            "orientation": r["orientation"],
            "margin_top": r["margin_top"],
            "margin_bottom": r["margin_bottom"],
            "margin_left": r["margin_left"],
            "margin_right": r["margin_right"],
            "config": json.loads(r["config_json"]) if r["config_json"] else None,
            "is_default": bool(r["is_default"]),
            "has_preview": bool(preview_path and os.path.exists(preview_path)),
            "created_at": r["created_at"]
        })
    return templates

@router.get("/{template_id}/preview-image")
@router.get("/{template_id}/thumbnail")
async def get_template_preview_image(template_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT preview_image_path, file_path FROM templates WHERE id = ?", (template_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Template not found.")

    preview_path = row["preview_image_path"]
    if preview_path and os.path.exists(preview_path):
        return FileResponse(preview_path, media_type="image/png")

    file_path = row["file_path"]
    if file_path and os.path.exists(file_path):
        # Generate on the fly
        try:
            gen_preview = os.path.join(TEMPLATES_DIR, f"{template_id}_preview.png")
            generate_preview_image(file_path, gen_preview)
            # Update DB cache
            c2 = get_db()
            c2.execute("UPDATE templates SET preview_image_path = ? WHERE id = ?", (gen_preview, template_id))
            c2.commit()
            c2.close()
            return FileResponse(gen_preview, media_type="image/png")
        except Exception as e:
            print(f"Error generating preview for {template_id}:", e)
            raise HTTPException(status_code=500, detail="Failed to render preview image.")

    raise HTTPException(status_code=404, detail="Preview not available.")

@router.post("/upload")
async def upload_template(
    file: UploadFile = File(...),
    name: str = Form(...),
    paper_size: str = Form("A4"),
    orientation: str = Form("portrait"),
    margin_top: float = Form(105.0),
    margin_bottom: float = Form(60.0),
    margin_left: float = Form(36.0),
    margin_right: float = Form(36.0)
):
    filename = file.filename or "letterhead.pdf"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".pdf", ".png", ".jpg", ".jpeg"]:
        raise HTTPException(status_code=400, detail="Allowed template formats: PDF, PNG, JPG, JPEG.")

    template_id = str(uuid.uuid4())
    stored_name = f"{template_id}_{os.path.basename(filename)}"
    dest_path = os.path.join(TEMPLATES_DIR, stored_name)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    template_type = "uploaded_pdf" if ext == ".pdf" else "uploaded_image"

    # Generate preview thumbnail
    preview_path = os.path.join(TEMPLATES_DIR, f"{template_id}_preview.png")
    try:
        generate_preview_image(dest_path, preview_path)
    except Exception as e:
        preview_path = None
        print("Warning: Failed to generate thumbnail:", e)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO templates (id, name, type, file_path, paper_size, orientation,
                          margin_top, margin_bottom, margin_left, margin_right,
                          preview_image_path, is_default, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    """, (template_id, name, template_type, dest_path, paper_size, orientation,
          margin_top, margin_bottom, margin_left, margin_right, preview_path, datetime.now().isoformat()))
    conn.commit()
    conn.close()

    return {
        "id": template_id,
        "name": name,
        "type": template_type,
        "paper_size": paper_size,
        "orientation": orientation,
        "margin_top": margin_top,
        "margin_bottom": margin_bottom,
        "margin_left": margin_left,
        "margin_right": margin_right
    }

@router.post("/build")
async def build_custom_template(req: CustomTemplateBuildRequest):
    template_id = str(uuid.uuid4())
    pdf_filename = f"{template_id}_built.pdf"
    pdf_path = os.path.join(TEMPLATES_DIR, pdf_filename)

    config_dict = req.model_dump()
    if req.logo_file_id:
        logo_path = os.path.join(TEMPLATES_DIR, f"logo_{req.logo_file_id}")
        if os.path.exists(logo_path):
            config_dict["logo_path"] = logo_path

    try:
        render_custom_template_pdf(config_dict, pdf_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to render custom template PDF: {str(e)}")

    # Preview image
    preview_path = os.path.join(TEMPLATES_DIR, f"{template_id}_preview.png")
    generate_preview_image(pdf_path, preview_path)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO templates (id, name, type, file_path, paper_size, orientation,
                          margin_top, margin_bottom, margin_left, margin_right,
                          config_json, preview_image_path, is_default, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    """, (template_id, req.name, "custom_builder", pdf_path, req.paper_size, req.orientation,
          req.margin_top, req.margin_bottom, req.margin_left, req.margin_right,
          json.dumps(config_dict), preview_path, datetime.now().isoformat()))
    conn.commit()
    conn.close()

    return {"id": template_id, "name": req.name, "type": "custom_builder"}

@router.post("/upload-logo")
async def upload_logo(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".png", ".jpg", ".jpeg", ".webp"]:
        raise HTTPException(status_code=400, detail="Logo must be an image (PNG, JPG, WEBP).")

    logo_id = str(uuid.uuid4())
    logo_path = os.path.join(TEMPLATES_DIR, f"logo_{logo_id}")

    with open(logo_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"logo_file_id": logo_id}

@router.put("/{template_id}")
async def update_template(template_id: str, req: TemplateUpdateMarginsRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM templates WHERE id = ?", (template_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Template not found.")

    updates = []
    params = []
    if req.name is not None:
        updates.append("name = ?")
        params.append(req.name)
    if req.margin_top is not None:
        updates.append("margin_top = ?")
        params.append(req.margin_top)
    if req.margin_bottom is not None:
        updates.append("margin_bottom = ?")
        params.append(req.margin_bottom)
    if req.margin_left is not None:
        updates.append("margin_left = ?")
        params.append(req.margin_left)
    if req.margin_right is not None:
        updates.append("margin_right = ?")
        params.append(req.margin_right)
    if req.paper_size is not None:
        updates.append("paper_size = ?")
        params.append(req.paper_size)
    if req.orientation is not None:
        updates.append("orientation = ?")
        params.append(req.orientation)

    if updates:
        params.append(template_id)
        cursor.execute(f"UPDATE templates SET {', '.join(updates)} WHERE id = ?", params)
        conn.commit()

    conn.close()
    return {"success": True}

@router.post("/{template_id}/set-default")
async def set_default_template(template_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE templates SET is_default = 0")
    cursor.execute("UPDATE templates SET is_default = 1 WHERE id = ?", (template_id,))
    conn.commit()
    conn.close()
    return {"success": True}

@router.post("/{template_id}/duplicate")
async def duplicate_template(template_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM templates WHERE id = ?", (template_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Template not found.")

    new_id = str(uuid.uuid4())
    new_name = f"{row['name']} (Copy)"
    orig_file = row["file_path"]
    new_file = None

    if orig_file and os.path.exists(orig_file):
        ext = os.path.splitext(orig_file)[1]
        new_file = os.path.join(TEMPLATES_DIR, f"{new_id}_copy{ext}")
        shutil.copy2(orig_file, new_file)

    preview_path = None
    if new_file:
        preview_path = os.path.join(TEMPLATES_DIR, f"{new_id}_preview.png")
        try:
            generate_preview_image(new_file, preview_path)
        except Exception:
            preview_path = None

    cursor.execute("""
    INSERT INTO templates (id, name, type, file_path, paper_size, orientation,
                          margin_top, margin_bottom, margin_left, margin_right,
                          config_json, preview_image_path, is_default, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    """, (new_id, new_name, row["type"], new_file, row["paper_size"], row["orientation"],
          row["margin_top"], row["margin_bottom"], row["margin_left"], row["margin_right"],
          row["config_json"], preview_path, datetime.now().isoformat()))
    conn.commit()
    conn.close()

    return {"id": new_id, "name": new_name}

@router.delete("/{template_id}")
async def delete_template(template_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT file_path, preview_image_path FROM templates WHERE id = ?", (template_id,))
    row = cursor.fetchone()
    if row:
        # Don't delete bundled sample files
        if row["file_path"] and "samples" not in row["file_path"] and os.path.exists(row["file_path"]):
            try:
                os.remove(row["file_path"])
            except Exception:
                pass
        if row["preview_image_path"] and os.path.exists(row["preview_image_path"]):
            try:
                os.remove(row["preview_image_path"])
            except Exception:
                pass

        cursor.execute("DELETE FROM templates WHERE id = ?", (template_id,))
        conn.commit()
    conn.close()
    return {"success": True}
