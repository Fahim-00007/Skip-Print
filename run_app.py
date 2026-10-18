"""
BillCraft Application Launcher.
Starts the FastAPI backend and serves the desktop-friendly web application.
"""
import os
import sys
import webbrowser
import uvicorn

def main():
    print("=" * 65)
    print("  BillCraft - Excel to Professional PDF Generator")
    print("=" * 65)
    print("Starting local server on http://127.0.0.1:8000 ...")
    print("All documents are processed 100% locally and privately.")
    print("Press Ctrl+C to stop.")
    print("=" * 65)

    # Open browser automatically if requested
    if "--no-browser" not in sys.argv:
        try:
            webbrowser.open("http://127.0.0.1:8000")
        except Exception:
            pass

    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)

if __name__ == "__main__":
    main()
