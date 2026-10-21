"""
Database management for BillCraft using SQLite.
Stores templates, saved signatures, recent files, and user preferences.
Trained on real-world Sarwar General Store (SGS) scanned bills.
"""
import os
import sqlite3
import json
import uuid
from datetime import datetime

from backend.paths import DB_PATH, ensure_sample_assets

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL, -- 'uploaded_pdf', 'uploaded_image', 'custom_builder'
        file_path TEXT,
        paper_size TEXT DEFAULT 'A4', -- 'A4', 'Letter', 'Custom'
        orientation TEXT DEFAULT 'portrait', -- 'portrait', 'landscape'
        margin_top REAL DEFAULT 105.0,
        margin_bottom REAL DEFAULT 65.0,
        margin_left REAL DEFAULT 36.0,
        margin_right REAL DEFAULT 36.0,
        config_json TEXT,
        preview_image_path TEXT,
        is_default INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS signatures (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        preview_image_path TEXT,
        created_at TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recent_files (
        id TEXT PRIMARY KEY,
        excel_filename TEXT NOT NULL,
        excel_file_path TEXT NOT NULL,
        output_pdf_filename TEXT NOT NULL,
        output_pdf_path TEXT NOT NULL,
        template_name TEXT,
        template_id TEXT,
        page_count INTEGER DEFAULT 1,
        file_size INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    """)

    conn.commit()

    # Seed with sample templates and signature if none exist
    cursor.execute("SELECT COUNT(*) FROM templates")
    if cursor.fetchone()[0] == 0:
        seed_samples(cursor)
        conn.commit()
    else:
        # Ensure SGS official template is present and default
        seed_sgs_template(cursor)
        conn.commit()

    conn.close()

def seed_sgs_template(cursor):
    now = datetime.now().isoformat()
    samples_dir = ensure_sample_assets()
    pdf_lh = os.path.join(samples_dir, "sgs_letterhead.pdf")
    if not os.path.exists(pdf_lh):
        pdf_lh = os.path.join(samples_dir, "sample_letterhead.pdf")
    png_lh = os.path.join(samples_dir, "sgs_letterhead.png")
    if not os.path.exists(png_lh):
        png_lh = os.path.join(samples_dir, "sample_letterhead.png")
    sig_png = os.path.join(samples_dir, "sample_signature.png")

    # Check if SGS template already exists
    cursor.execute("SELECT id FROM templates WHERE id = 'sgs-official-pad'")
    if not cursor.fetchone():
        # Set all others to non-default
        cursor.execute("UPDATE templates SET is_default = 0")
        cursor.execute("""
        INSERT INTO templates (id, name, type, file_path, paper_size, orientation, margin_top, margin_bottom, margin_left, margin_right, is_default, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ("sgs-official-pad", "Sarwar General Store (Official Vector Pad)", "uploaded_pdf", pdf_lh, "A4", "portrait", 105.0, 65.0, 36.0, 36.0, 1, now))

    cursor.execute("SELECT id FROM signatures WHERE id = 'sgs-sig-parves'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO signatures (id, name, file_path, created_at)
        VALUES (?, ?, ?, ?)
        """, ("sgs-sig-parves", "MD. Parves Hossan Rajib (Proprietor)", sig_png, now))

def seed_samples(cursor):
    now = datetime.now().isoformat()
    samples_dir = ensure_sample_assets()
    pdf_lh = os.path.join(samples_dir, "sgs_letterhead.pdf")
    if not os.path.exists(pdf_lh):
        pdf_lh = os.path.join(samples_dir, "sample_letterhead.pdf")
    png_lh = os.path.join(samples_dir, "sgs_letterhead.png")
    if not os.path.exists(png_lh):
        png_lh = os.path.join(samples_dir, "sample_letterhead.png")
    sig_png = os.path.join(samples_dir, "sample_signature.png")

    if os.path.exists(pdf_lh):
        cursor.execute("""
        INSERT INTO templates (id, name, type, file_path, paper_size, orientation, margin_top, margin_bottom, margin_left, margin_right, is_default, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ("sgs-official-pad", "Sarwar General Store (Official Vector Pad)", "uploaded_pdf", pdf_lh, "A4", "portrait", 105.0, 65.0, 36.0, 36.0, 1, now))

    if os.path.exists(png_lh):
        cursor.execute("""
        INSERT INTO templates (id, name, type, file_path, paper_size, orientation, margin_top, margin_bottom, margin_left, margin_right, is_default, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ("sgs-classic-image-pad", "Sarwar General Store (Image Pad)", "uploaded_image", png_lh, "A4", "portrait", 105.0, 65.0, 36.0, 36.0, 0, now))

    if os.path.exists(sig_png):
        cursor.execute("""
        INSERT INTO signatures (id, name, file_path, created_at)
        VALUES (?, ?, ?, ?)
        """, ("sgs-sig-parves", "MD. Parves Hossan Rajib (Proprietor)", sig_png, now))

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)
