@echo off
title BillCraft Desktop App
if exist "dist\BillCraft\BillCraft.exe" (
    start "" "dist\BillCraft\BillCraft.exe"
) else (
    start "" pyw desktop_app.py
)
exit
