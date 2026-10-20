# BillCraft - Excel to Professional PDF Generator

BillCraft is a desktop-friendly fullstack web application that converts Excel bills, invoices, and estimates (`.xlsx` and `.xls`) into high-quality, professional PDF documents digitally printed onto custom company letterheads and pad templates, with interactive drag-and-drop transparent PNG signature placement.

---

## The Problem Solved

Traditional invoicing often involves printing Excel bills onto physical pre-printed letterhead paper, scanning the paper document back to a computer, and emailing a large, fuzzy, non-editable scanned image.

**BillCraft eliminates printing and scanning entirely**:
1. Upload your existing Excel bill (`.xlsx` or `.xls`).
2. Choose or create your company letterhead (PDF or high-res image).
3. Preview how the bill appears on the letterhead with live alignment adjustments.
4. Drag and position your transparent PNG signature directly onto the preview.
5. Generate a sharp, digital PDF with **100% selectable text**, vector graphics, and letterhead background without any document flattening or quality degradation.

---

## Core Features

- **Excel Processing**:
  - Full support for `.xlsx` and legacy `.xls` workbooks.
  - Automatic worksheet detection and multi-sheet picker.
  - Interactive spreadsheet grid inspector showing cell values, formulas' calculated results, merged cells, fonts, fills, and borders.
  - Dual document-processing architecture:
    - **Primary Engine**: Native Microsoft Excel COM Automation (100% layout fidelity, exact vector graphics, page breaks, margins, and print areas).
    - **Pure-Python Fallback Engine**: OpenPyXL + ReportLab for standalone, cross-platform environments.

- **Company Letterhead Template Manager ("My Templates")**:
  - **Option A - Upload Existing Company Pad**: Support for vector PDF letterheads or high-res PNG/JPG scans.
  - **Option B - Visual Template Builder**: Build custom letterheads with company logo, business name, address, contact numbers, website, tax/VAT IDs, brand colors, and subtle watermarks.
  - Persistent SQLite storage for templates, default letterheads, duplicate, and delete actions.

- **Document Layout & Position Adjustment**:
  - **Mode 1: Fit to Company Pad**: Neatly positions the bill content within the reserved printable area below the header and above the footer.
  - **Mode 2: Preserve Excel Layout**: Respects Excel's original page settings.
  - Live fine-tuning: top/bottom/left/right margins, content scaling (50%–150%), and X/Y nudging.
  - Multi-page letterhead repetition toggle (repeat on every page or first page only).

- **Transparent PNG Signature Placement ("Add Signature")**:
  - Interactive on-canvas drag-and-drop positioning directly over the document preview.
  - Interactive corner resize handles.
  - Target page selection: "Last Page" (standard for invoices), "First Page", or "All Pages".
  - Opacity and rotation adjustments.
  - Saved signature library for 1-click reuse across future bills.
  - Full alpha-transparency preservation without document rasterization.

- **High-Quality PDF Generation & Export**:
  - True vector PDF output with selectable, copyable text.
  - Multi-page document support with correct pagination.
  - Download with custom filename (defaults to `<original_bill_name>.pdf`).
  - In-browser inspection and viewing.
  - Recent bills history with SQLite tracking, re-download, and cleanup tools.

- **100% Local Privacy & Security**:
  - All processing occurs locally on your machine.
  - No client data, prices, or signatures are ever sent to third-party servers or external AI services.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite.
- **Backend**: Python 3, FastAPI, Uvicorn, SQLite.
- **Excel & PDF Composition**:
  - `pymupdf` (PyMuPDF) - High-speed vector compositing, DPI preview rendering, and signature embedding.
  - `win32com.client` (pywin32) - Native headless Excel COM automation.
  - `openpyxl` & `xlrd` - Spreadsheet inspection, grid parsing, and cell styles.
  - `reportlab` - Vector letterhead builder & fallback table rendering.
  - `pillow` (PIL) - Image processing and thumbnail generation.

---

## Project Structure

```
BillCraft/
├── backend/
│   ├── main.py                     # FastAPI server & static file host
│   ├── paths.py                    # Dev/frozen paths & writable user-data folder
│   ├── database.py                 # SQLite database setup & seed data
│   ├── models.py                   # Pydantic schemas
│   ├── requirements.txt            # Python dependencies
│   ├── routers/
│   │   ├── excel.py                # Upload, sheet inspection, grid preview
│   │   ├── templates.py            # Letterhead templates management & visual builder
│   │   ├── signatures.py           # Transparent signature library
│   │   ├── generator.py            # Live preview rendering & PDF generation
│   │   └── recent.py               # History & cache cleanup
│   ├── services/
│   │   ├── excel_converter.py      # COM & ReportLab dual conversion engine
│   │   ├── excel_reader.py         # Workbook parser & sheet preview grid
│   │   ├── pdf_composer.py         # Multi-page vector PDF composition & overlay
│   │   └── template_renderer.py    # Custom letterhead PDF generator
│   ├── samples/                    # Bundled sample invoices, letterheads, and signatures
│   │   ├── sample_invoice.xlsx
│   │   ├── sample_multipage_invoice.xlsx
│   │   ├── sample_legacy.xls
│   │   ├── sample_letterhead.pdf
│   │   ├── sample_letterhead.png
│   │   └── sample_signature.png
│   └── tests/
│       └── test_all_scenarios.py   # Automated 12-scenario test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Header, StepIndicator
│   │   │   ├── preview/            # LivePreview (zoom, drag-and-drop), SpreadsheetGrid
│   │   │   ├── wizard/             # Steps 1 to 5
│   │   │   ├── templates/          # TemplateManager, UploadModal, BuilderModal
│   │   │   ├── signatures/         # SignatureManager
│   │   │   ├── recent/             # RecentFiles
│   │   │   └── settings/           # SettingsView
│   │   ├── api/client.ts           # API service client
│   │   └── types/index.ts          # TypeScript interfaces
│   ├── dist/                       # Pre-built production frontend bundle
│   └── package.json
├── assets/
│   ├── billcraft.ico                # Application & installer icon
│   ├── billcraft.png
│   ├── wizard-large.bmp             # Installer artwork
│   ├── wizard-small.bmp
│   └── generate_icon.py             # Regenerates all icon/artwork assets
├── installer/
│   └── BillCraft.iss                # Inno Setup installer definition
├── dist/BillCraft/                  # Built desktop app (git-ignored)
├── desktop_app.py                   # Native Windows desktop window launcher
├── build_installer.ps1              # One-command release build script
├── BillCraft.spec                   # PyInstaller build definition
├── version_info.txt                 # Windows executable metadata
├── run_app.py                       # Browser-based fullstack launcher
├── start.bat                        # Windows one-click batch launcher
└── README.md
```

---

## Windows Desktop App (Recommended)

BillCraft installs like a normal Windows application: no terminal, no Python,
and no browser tabs.

### Install

1. Double-click **`installer\output\BillCraft-Setup-1.0.0.exe`**.
2. Follow the setup wizard.
3. Launch **BillCraft** from the **desktop shortcut** or the Start menu.

The installer is per-user, so it does **not** require administrator rights. It
creates:

- `%LOCALAPPDATA%\Programs\BillCraft\BillCraft.exe`
- A **BillCraft** icon on your desktop
- A **BillCraft** entry in the Start menu, including an uninstaller

### Requirements

- Windows 10 or Windows 11, 64-bit.
- Microsoft Edge **WebView2 Runtime** (included with Windows 11 and current
  Windows 10; the installer offers a download link if it is missing).
- Microsoft Excel is optional. When installed it is used for perfect Excel
  layout fidelity; otherwise BillCraft falls back to its built-in PDF engine.

### Where your data lives

Your database, saved templates, signatures, uploads, and generated PDFs are
stored privately in:

```
%LOCALAPPDATA%\BillCraft\
├── billcraft.db
├── logs\app.log
├── outputs\
├── samples\
├── signatures\
├── templates\
└── uploads\
```

This folder is **not** deleted when you uninstall, so your templates and
history survive upgrades. Use **Settings → Clear Temp Cache** inside the app
to remove intermediate preview files.

### Uninstall

Open **Settings → Apps → Installed apps → BillCraft → Uninstall**, or use the
uninstaller in the Start menu folder.

---

## Build the Desktop Installer

The built setup file is ready to use. To rebuild it after changing the
source code:

```powershell
# One-time build dependencies
py -m pip install -r backend/requirements.txt pyinstaller pywebview
winget install JRSoftware.InnoSetup

# Build frontend + EXE + installer
powershell -ExecutionPolicy Bypass -File .\build_installer.ps1
```

Outputs:

- Desktop executable: `dist\BillCraft\BillCraft.exe`
- Windows setup file: `installer\output\BillCraft-Setup-1.0.0.exe`

Useful switches for faster rebuilds:

```powershell
# Skip rebuilding the React frontend
powershell -ExecutionPolicy Bypass -File .\build_installer.ps1 -SkipFrontend

# Only recompile the installer from an existing dist\BillCraft folder
powershell -ExecutionPolicy Bypass -File .\build_installer.ps1 -SkipFrontend -SkipExe
```

> **Note:** The setup file is not code-signed. Windows SmartScreen may show a
> "Windows protected your PC" warning on first run. Click **More info → Run
> anyway**, or sign the installer with your own code-signing certificate.

---

## Development Setup

### 1. Install Backend Dependencies

```bash
py -m pip install -r backend/requirements.txt
```

### 2. Launch in the Native Desktop Window

```bash
py desktop_app.py
```

*(Or double-click `Launch-Desktop-App.bat` on Windows.)*

### 3. Launch in Your Browser (alternative)

```bash
py run_app.py
```
*(Or double-click `start.bat` on Windows)*

The application starts on **`http://127.0.0.1:8000`** and opens automatically in your web browser.

### 4. (Optional) Run Frontend in Development Mode

If you wish to edit the frontend with live Hot Module Replacement (HMR):
```bash
cd frontend
npm install
npm run dev
```

---

## Verification & Automated Test Suite

A comprehensive test suite covering all 12 acceptance criteria from Section 15 of the specification is provided:

```bash
py backend/tests/test_all_scenarios.py
```

### Test Coverage:
1. **Standard `.xlsx` Upload & Inspection**: Cell values, number formats, formula results, merged cells.
2. **Legacy `.xls` Support**: Conversion and vector text extraction.
3. **PDF Letterhead Background**: Vector merging behind bill content.
4. **PNG Letterhead Background**: High-resolution image pad background underlay.
5. **Reusable Template Builder**: Custom company details, logo, colors, and SQLite persistence.
6. **Transparent Signature Embedding**: PNG alpha transparency preserved without document flattening.
7. **Multi-Page Documents**: Letterhead repetition across pages, signature placement on the last page.
8. **100% Selectable Text**: Confirmed that output PDFs contain selectable, searchable text objects.
9. **Signature Coordinate Precision**: Accurate point/pixel geometry placement.
10. **Database Persistence**: Saved templates and signatures persist across application restarts.
11. **Paper Formats & Orientations**: A4 and Letter sizing, Portrait and Landscape geometry.
12. **Error Handling**: Graceful error messages on invalid or malformed files.

---

## Privacy & Security

- **Local Storage Only**: Templates, signatures, and output documents are saved in `backend/storage/`.
- **No External Cloud Calls**: Zero external network requests or AI endpoints are used.
- **Zero Document Flattening**: PDFs are generated using vector layers, ensuring crisp text and small file sizes.
- **Cache Management**: A "Clear Temp Cache" button is built into the Settings page to remove intermediate preview files anytime.
