"""
BillCraft Native Desktop Application.

Runs BillCraft inside a dedicated native Windows desktop window using pywebview
(Edge Chromium / WebView2). No browser tabs, no URL bar, standalone window with
native taskbar integration.
"""
import ctypes
import logging
import os
import socket
import sys
import threading
import time
import traceback
import webbrowser

# ---------------------------------------------------------------------------
# Locate the application resources. In a PyInstaller build this is the
# temporary / installation bundle directory; in development it is the repo.
# ---------------------------------------------------------------------------
if getattr(sys, "frozen", False):
    ROOT_DIR = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(sys.executable)))
else:
    ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

# Logging must be configured before importing the backend so startup failures
# are always captured in a file (the packaged app has no console window).
try:
    from backend.paths import LOG_DIR

    os.makedirs(LOG_DIR, exist_ok=True)
    LOG_PATH = os.path.join(LOG_DIR, "app.log")
except Exception:
    LOG_PATH = os.path.join(
        os.environ.get("LOCALAPPDATA", os.path.expanduser("~")), "BillCraft", "app.log"
    )
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)

logging.basicConfig(
    filename=LOG_PATH,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("BillCraft")

APP_TITLE = "BillCraft - Excel to Professional PDF Generator"
MUTEX_NAME = "Local\\BillCraftDesktopApplication"


def show_error(message: str, title: str = "BillCraft") -> None:
    """Show a native message box even when the app has no console."""
    try:
        ctypes.windll.user32.MessageBoxW(None, message, title, 0x10)
    except Exception:
        logger.error("MessageBox failed: %s", message)


def acquire_single_instance_lock():
    """Keep a named mutex alive for the process lifetime."""
    try:
        handle = ctypes.windll.kernel32.CreateMutexW(None, False, MUTEX_NAME)
        if ctypes.windll.kernel32.GetLastError() == 183:  # ERROR_ALREADY_EXISTS
            return None
        return handle
    except Exception:
        # If the mutex cannot be created, let the app start rather than fail.
        return True


def find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def wait_for_backend(port: int, timeout: float = 30.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=0.5):
                return True
        except OSError:
            time.sleep(0.15)
    return False


def run_backend(port: int) -> None:
    import uvicorn

    from backend.main import app

    try:
        uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")
    except Exception:
        logger.error("Backend server crashed:\n%s", traceback.format_exc())


def window_size() -> tuple[int, int]:
    """Pick a sensible window size that fits the current screen."""
    try:
        user32 = ctypes.windll.user32
        screen_w = user32.GetSystemMetrics(0)
        screen_h = user32.GetSystemMetrics(1)
        width = max(900, min(1380, screen_w - 80))
        height = max(620, min(880, screen_h - 120))
        return width, height
    except Exception:
        return 1380, 880


def main() -> int:
    logger.info("Starting BillCraft desktop application (frozen=%s)", getattr(sys, "frozen", False))

    lock = acquire_single_instance_lock()
    if lock is None:
        show_error("BillCraft is already running.\n\nCheck your taskbar for the open window.")
        return 0

    # Make the Windows taskbar group and icon identify this app correctly.
    try:
        ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID("BillCraft.Desktop.1.0")
    except Exception:
        pass

    try:
        import webview
    except Exception:
        logger.error("Failed to import pywebview:\n%s", traceback.format_exc())
        show_error(
            "BillCraft could not start its desktop window because a required "
            "component is missing.\n\nPlease reinstall BillCraft from the setup file."
        )
        return 1

    port = find_free_port()
    server_thread = threading.Thread(target=run_backend, args=(port,), daemon=True)
    server_thread.start()

    if not wait_for_backend(port):
        logger.error("Backend did not become ready in time.")
        show_error(
            "BillCraft could not start its local document engine.\n\n"
            f"Details were written to:\n{LOG_PATH}"
        )
        return 1

    # Allow PDF downloads from the embedded WebView2 window.
    webview.settings["ALLOW_DOWNLOADS"] = True

    width, height = window_size()
    url = f"http://127.0.0.1:{port}"
    webview.create_window(
        title=APP_TITLE,
        url=url,
        width=width,
        height=height,
        min_size=(900, 620),
        resizable=True,
        text_select=True,
        zoomable=True,
    )

    try:
        # Start native desktop window loop (blocking until user closes the window)
        webview.start(gui="edgechromium")
        logger.info("BillCraft desktop window closed normally.")
        return 0
    except Exception:
        logger.error("WebView2 window failed:\n%s", traceback.format_exc())
        try:
            webbrowser.open(url)
        except Exception:
            pass
        show_error(
            "BillCraft could not open its desktop window because Microsoft Edge "
            "WebView2 is missing or damaged.\n\n"
            "BillCraft has been opened in your default web browser instead.\n"
            "Close this message to exit BillCraft.\n\n"
            "To restore the desktop window, install the Microsoft Edge WebView2 "
            "Runtime from https://go.microsoft.com/fwlink/p/?LinkId=2124703"
        )
        return 1


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SystemExit:
        raise
    except Exception:
        logger.error("Unhandled startup error:\n%s", traceback.format_exc())
        show_error(
            "BillCraft failed to start.\n\n"
            f"Details were written to:\n{LOG_PATH}"
        )
        raise SystemExit(1)
