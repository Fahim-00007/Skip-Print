# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller build definition for the BillCraft desktop application."""

hiddenimports = [
    # Uvicorn dynamically imports its protocol/event-loop implementations.
    'uvicorn.logging',
    'uvicorn.loops',
    'uvicorn.loops.auto',
    'uvicorn.loops.asyncio',
    'uvicorn.protocols',
    'uvicorn.protocols.http',
    'uvicorn.protocols.http.auto',
    'uvicorn.protocols.http.h11_impl',
    'uvicorn.protocols.websockets',
    'uvicorn.protocols.websockets.auto',
    'uvicorn.lifespan',
    'uvicorn.lifespan.on',
    # pywebview's Windows backend is imported dynamically.
    'webview.platforms.edgechromium',
    'webview.platforms.winforms',
    # pywin32 COM support used for native Excel conversion.
    'clr',
    'pythoncom',
    'pywintypes',
    'win32com',
    'win32com.client',
    'win32timezone',
]

a = Analysis(
    ['desktop_app.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('backend/samples', 'backend/samples'),
        ('frontend/dist', 'frontend/dist'),
    ],
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'tkinter',
        'pytest',
        'IPython',
        'PyQt5',
        'PySide6',
        'PySide2',
        # PyMuPDF's optional table helper imports pandas for its to_pandas()
        # method. BillCraft never calls it, so the entire scientific stack is
        # excluded to keep the installer small.
        'pandas',
        'numpy',
        'scipy',
        'matplotlib',
        'mpl_toolkits',
        'contourpy',
        'kiwisolver',
        'fontTools',
        'dateutil',
        'sqlalchemy',
        'psycopg2',
        'jinja2',
    ],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='BillCraft',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='assets/billcraft.ico',
    version='version_info.txt',
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='BillCraft',
)
