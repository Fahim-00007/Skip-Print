<#
.SYNOPSIS
    Build the BillCraft desktop executable and Windows setup file.

.DESCRIPTION
    Runs the complete release pipeline:
      1. Builds the production frontend (Vite).
      2. Generates the application icon and installer artwork.
      3. Packages the desktop application with PyInstaller.
      4. Compiles the Windows installer with Inno Setup.

    Requirements:
      - Python 3.10+ with requirements.txt and pyinstaller + pywebview installed.
      - Node.js / npm.
      - Inno Setup 6 (https://jrsoftware.org/isinfo.php).

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\build_installer.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\build_installer.ps1 -SkipFrontend
#>
param(
    [switch]$SkipFrontend,
    [switch]$SkipExe
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Find-Iscc {
    $candidates = @(
        (Join-Path $env:LOCALAPPDATA "Programs\Inno Setup 6\ISCC.exe"),
        "C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
        "C:\Program Files\Inno Setup 6\ISCC.exe"
    )
    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) { return $candidate }
    }
    $command = Get-Command ISCC.exe -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }
    throw "Inno Setup 6 was not found. Install it with: winget install JRSoftware.InnoSetup"
}

if (Get-Process BillCraft -ErrorAction SilentlyContinue) {
    throw "BillCraft is currently running. Close it before building."
}

if (-not $SkipFrontend) {
    Write-Step "Building production frontend"
    Push-Location (Join-Path $Root "frontend")
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "Frontend build failed." }
    }
    finally {
        Pop-Location
    }
}

Write-Step "Generating application icon and installer artwork"
py (Join-Path $Root "assets\generate_icon.py")
if ($LASTEXITCODE -ne 0) { throw "Icon generation failed." }

if (-not $SkipExe) {
    Write-Step "Packaging desktop application with PyInstaller"
    py -m PyInstaller --noconfirm --clean (Join-Path $Root "BillCraft.spec")
    if ($LASTEXITCODE -ne 0) { throw "PyInstaller build failed." }
}

$exe = Join-Path $Root "dist\BillCraft\BillCraft.exe"
if (-not (Test-Path $exe)) {
    throw "Packaged executable not found at $exe"
}

Write-Step "Compiling Windows setup file with Inno Setup"
$iscc = Find-Iscc
& $iscc (Join-Path $Root "installer\BillCraft.iss")
if ($LASTEXITCODE -ne 0) { throw "Inno Setup compilation failed." }

$setup = Join-Path $Root "installer\output\BillCraft-Setup-1.0.0.exe"
if (-not (Test-Path $setup)) {
    throw "Setup file was not created."
}

$sizeMb = [math]::Round((Get-Item $setup).Length / 1MB, 1)
Write-Host ""
Write-Host "Build complete!" -ForegroundColor Green
Write-Host "  Executable: $exe"
Write-Host "  Installer : $setup ($sizeMb MB)"
