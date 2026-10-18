"""
Recent files and settings router.
Manages generation history, file cleanup, and user preferences.
"""
import os
from fastapi import APIRouter, HTTPException
from backend.database import get_db

router = APIRouter(prefix="/api/recent", tags=["Recent"])

OUTPUTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "storage", "outputs")

@router.get("")
async def get_recent_files():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, excel_filename, excel_file_path, output_pdf_filename, output_pdf_path,
           template_name, template_id, page_count, file_size, created_at
    FROM recent_files
    ORDER BY created_at DESC
    LIMIT 50
    """)
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        orig_exists = bool(r["excel_file_path"] and os.path.exists(r["excel_file_path"]))
        pdf_exists = bool(r["output_pdf_path"] and os.path.exists(r["output_pdf_path"]))

        result.append({
            "id": r["id"],
            "excel_filename": r["excel_filename"],
            "output_pdf_filename": r["output_pdf_filename"],
            "template_name": r["template_name"] or "Custom Template",
            "page_count": r["page_count"],
            "file_size": r["file_size"],
            "created_at": r["created_at"],
            "original_available": orig_exists,
            "pdf_available": pdf_exists,
            "download_url": f"/api/render/download/{r['id']}",
            "view_url": f"/api/render/view/{r['id']}"
        })
    return result

@router.delete("/{record_id}")
async def delete_recent_record(record_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT output_pdf_path FROM recent_files WHERE id = ?", (record_id,))
    row = cursor.fetchone()
    if row and row["output_pdf_path"] and os.path.exists(row["output_pdf_path"]):
        try:
            os.remove(row["output_pdf_path"])
        except Exception:
            pass

    cursor.execute("DELETE FROM recent_files WHERE id = ?", (record_id,))
    conn.commit()
    conn.close()
    return {"success": True}

@router.post("/cleanup")
async def cleanup_temp_files():
    """
    Cleans up temporary preview and raw files older than 24 hours.
    """
    cleaned = 0
    if os.path.exists(OUTPUTS_DIR):
        for fname in os.listdir(OUTPUTS_DIR):
            if fname.startswith("temp_") or fname.startswith("raw_") or fname.startswith("preview_"):
                fpath = os.path.join(OUTPUTS_DIR, fname)
                try:
                    os.remove(fpath)
                    cleaned += 1
                except Exception:
                    pass
    return {"cleaned_files_count": cleaned}
