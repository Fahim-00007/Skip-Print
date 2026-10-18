"""
BillCraft Native Desktop Application.
Runs BillCraft inside a dedicated native Windows desktop window using pywebview (Edge Chromium WebView2).
No browser tabs, no URL bar, standalone window with native taskbar integration.
"""
import os
import sys
import threading
import time
import socket
import uvicorn
import webview

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.main import app

def find_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('127.0.0.1', 0))
    port = s.getsockname()[1]
    s.close()
    return port

def run_backend(port):
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")

def main():
    port = find_free_port()

    # Start FastAPI backend in a background daemon thread
    server_thread = threading.Thread(target=run_backend, args=(port,), daemon=True)
    server_thread.start()

    # Wait briefly for backend initialization
    time.sleep(1.2)

    # Launch Native Windows Desktop Window
    window = webview.create_window(
        title="BillCraft - Excel to Professional PDF Generator",
        url=f"http://127.0.0.1:{port}",
        width=1380,
        height=880,
        min_size=(980, 650),
        resizable=True,
        text_select=True,
        zoomable=True
    )

    # Start native desktop window loop (blocking until user closes the window)
    webview.start(gui="edgechromium")

if __name__ == "__main__":
    main()
