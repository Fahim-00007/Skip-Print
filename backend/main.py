"""
BillCraft Backend Application Entry Point.
FastAPI REST API serving document conversion, template management, and PDF composition.
"""
import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.database import init_db
from backend.paths import DATA_DIR, FRONTEND_DIST
from backend.routers import excel, templates, signatures, generator, recent

# Initialize SQLite database
init_db()

app = FastAPI(
    title="BillCraft API",
    description="Excel to Professional PDF Generator with Custom Letterheads & Signatures",
    version="1.0.0"
)

# CORS Middleware for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(excel.router)
app.include_router(templates.router)
app.include_router(signatures.router)
app.include_router(generator.router)
app.include_router(recent.router)

# Mount Storage directory for static assets
app.mount("/storage", StaticFiles(directory=DATA_DIR), name="storage")

# Health check
@app.get("/api/health")
async def health_check():
    has_com = False
    if sys.platform == "win32":
        try:
            import win32com.client
            has_com = True
        except Exception:
            has_com = False

    return {
        "status": "healthy",
        "app": "BillCraft",
        "version": "1.0.0",
        "excel_com_available": has_com,
        "platform": sys.platform
    }

# Check if production frontend is built
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
else:
    @app.get("/")
    async def root():
        return {
            "message": "BillCraft API is running.",
            "docs": "/docs",
            "health": "/api/health"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
