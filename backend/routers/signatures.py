"""
Signature management router.
Handles uploading, storing, serving, and deleting PNG signatures.
"""
import os
import shutil
import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from backend.database import get_db
from backend.paths import SIGNATURES_DIR

router = APIRouter(prefix="/api/signatures", tags=["Signatures"])

@router.get("")
async def list_signatures():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, file_path, created_at FROM signatures ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        result.append({
            "id": r["id"],
            "name": r["name"],
            "created_at": r["created_at"],
            "url": f"/api/signatures/{r['id']}/image"
        })
    return result

@router.post("/upload")
async def upload_signature(
    file: UploadFile = File(...),
    name: str = Form("My Signature")
):
    filename = file.filename or "signature.png"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".png"]:
        raise HTTPException(
            status_code=400,
            detail="Signature must be a PNG image with transparency (preferred)."
        )

    sig_id = str(uuid.uuid4())
    stored_name = f"{sig_id}_{os.path.basename(filename)}"
    dest_path = os.path.join(SIGNATURES_DIR, stored_name)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO signatures (id, name, file_path, created_at)
    VALUES (?, ?, ?, ?)
    """, (sig_id, name, dest_path, datetime.now().isoformat()))
    conn.commit()
    conn.close()

    return {
        "id": sig_id,
        "name": name,
        "url": f"/api/signatures/{sig_id}/image"
    }

@router.get("/{sig_id}/image")
async def get_signature_image(sig_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT file_path FROM signatures WHERE id = ?", (sig_id,))
    row = cursor.fetchone()
    conn.close()

    if not row or not os.path.exists(row["file_path"]):
        raise HTTPException(status_code=404, detail="Signature image not found.")

    return FileResponse(row["file_path"], media_type="image/png")

@router.delete("/{sig_id}")
async def delete_signature(sig_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT file_path FROM signatures WHERE id = ?", (sig_id,))
    row = cursor.fetchone()
    if row and row["file_path"] and "samples" not in row["file_path"] and os.path.exists(row["file_path"]):
        try:
            os.remove(row["file_path"])
        except Exception:
            pass

    cursor.execute("DELETE FROM signatures WHERE id = ?", (sig_id,))
    conn.commit()
    conn.close()
    return {"success": True}
