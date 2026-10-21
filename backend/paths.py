"""
Central path configuration for BillCraft.

Development mode keeps everything inside ``backend/storage``.
Frozen desktop builds store user data in ``%LOCALAPPDATA%\\BillCraft`` so the
application works correctly when installed under ``Program Files`` (or any
other read-only location).
"""
import os
import sys

APP_NAME = "BillCraft"


def is_frozen() -> bool:
    """True when running from a PyInstaller executable."""
    return bool(getattr(sys, "frozen", False))


def _resource_root() -> str:
    """Directory that contains the bundled, read-only application resources."""
    if is_frozen():
        return getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(sys.executable)))
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


BASE_DIR = _resource_root()
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
SAMPLES_DIR = os.path.join(BACKEND_DIR, "samples")
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")


def _data_root() -> str:
    """Writable directory for the database, uploads and generated documents."""
    if is_frozen():
        local_appdata = os.environ.get("LOCALAPPDATA")
        if not local_appdata:
            local_appdata = os.path.join(os.path.expanduser("~"), "AppData", "Local")
        return os.path.join(local_appdata, APP_NAME)
    return os.path.join(BACKEND_DIR, "storage")


DATA_DIR = _data_root()
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
OUTPUTS_DIR = os.path.join(DATA_DIR, "outputs")
TEMPLATES_DIR = os.path.join(DATA_DIR, "templates")
SIGNATURES_DIR = os.path.join(DATA_DIR, "signatures")
USER_SAMPLES_DIR = os.path.join(DATA_DIR, "samples")
DB_PATH = os.path.join(DATA_DIR, "billcraft.db")
LOG_DIR = os.path.join(DATA_DIR, "logs")

for _directory in (
    DATA_DIR,
    UPLOADS_DIR,
    OUTPUTS_DIR,
    TEMPLATES_DIR,
    SIGNATURES_DIR,
    USER_SAMPLES_DIR,
    LOG_DIR,
):
    os.makedirs(_directory, exist_ok=True)

# Bundled sample assets that are copied into the writable data folder on first run.
_SAMPLE_FILES = (
    "sgs_letterhead.pdf",
    "sgs_letterhead.png",
    "sample_letterhead.pdf",
    "sample_letterhead.png",
    "sample_signature.png",
    "sample_invoice.xlsx",
    "sample_multipage_invoice.xlsx",
    "sample_legacy.xls",
)


def ensure_sample_assets() -> str:
    """Copy bundled samples into the writable data directory (once) and return it."""
    import shutil

    for filename in _SAMPLE_FILES:
        source = os.path.join(SAMPLES_DIR, filename)
        destination = os.path.join(USER_SAMPLES_DIR, filename)
        if os.path.exists(source) and not os.path.exists(destination):
            try:
                shutil.copy2(source, destination)
            except OSError:
                # Read-only data folders should never prevent startup.
                pass
    return USER_SAMPLES_DIR
