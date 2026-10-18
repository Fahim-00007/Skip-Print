"""
Quick server verification script.
Tests /api/health and frontend dist serving.
"""
import threading
import time
import urllib.request
import json
import uvicorn
import os
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.main import app

def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8999, log_level="warning")

if __name__ == "__main__":
    t = threading.Thread(target=run_server, daemon=True)
    t.start()
    time.sleep(2)

    try:
        with urllib.request.urlopen("http://127.0.0.1:8999/api/health") as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print("Health check response:", data)
            assert data["status"] == "healthy"
            print("Excel COM Available:", data["excel_com_available"])

        with urllib.request.urlopen("http://127.0.0.1:8999/") as resp:
            html = resp.read().decode("utf-8")
            print(f"Root HTML served successfully! (Length: {len(html)} bytes)")
            assert "<!doctype html>" in html.lower() or "<html" in html.lower()

        print("SUCCESS: Both Backend API and React Frontend are served flawlessly!")
    except Exception as e:
        print("Verification failed:", e)
        raise
