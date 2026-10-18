"""
Database management for BillCraft using SQLite.
Stores templates, saved signatures, recent files, and user preferences.
"""
import os
import sqlite3
import json
import uuid
from datetime import datetime

DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "storage")
DB_PATH = os.path.join(DB_DIR, "billcraft.db")
os.makedirs(DB_DIR, exist_ok=True)

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
        margin_bottom REAL DEFAULT 60.0,
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

    conn.close()

def seed_samples(cursor):
    now = datetime.now().isoformat()
    samples_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "samples")
    pdf_lh = os.path.join(samples_dir, "sample_letterhead.pdf")
    png_lh = os.path.join(samples_dir, "sample_letterhead.png")
    sig_png = os.path.join(samples_dir, "sample_signature.png")

    if os.path.exists(pdf_lh):
        t1_id = "sample-template-pdf"
        cursor.execute("""
        INSERT INTO templates (id, name, type, file_path, paper_size, orientation, margin_top, margin_bottom, margin_left, margin_right, is_default, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (t1_id, "Apex Dynamics (Vector PDF Pad)", "uploaded_pdf", pdf_lh, "A4", "portrait", 105.0, 60.0, 36.0, 36.0, 1, now))

    if os.path.exists(png_lh):
        t2_id = "sample-template-png"
        cursor.execute("""
        INSERT INTO templates (id, name, type, file_path, paper_size, orientation, margin_top, margin_bottom, margin_left, margin_right, is_default, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (t2_id, "Apex Dynamics (Classic Image Pad)", "uploaded_image", png_lh, "A4", "portrait", 110.0, 65.0, 40.0, 40.0, 0, now))

    if os.path.exists(sig_png):
        s1_id = "sample-sig-alex"
        cursor.execute("""
        INSERT INTO signatures (id, name, file_path, created_at)
        VALUES (?, ?, ?, ?)
        """, (s1_id, "Alex Morgan (Managing Director)", sig_png, now))

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)
