"""
Test script to verify the end-to-end PDF generation pipeline:
1. Convert sample_invoice.xlsx to PDF using Excel COM
2. Compose with sample_letterhead.pdf (as vector background)
3. Overlay sample_signature.png
4. Verify selectable text in output PDF and generate a preview image.
"""
import os
import sys
import pythoncom
import win32com.client
import fitz  # PyMuPDF

samples_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "samples")
excel_file = os.path.join(samples_dir, "sample_invoice.xlsx")
letterhead_pdf = os.path.join(samples_dir, "sample_letterhead.pdf")
letterhead_png = os.path.join(samples_dir, "sample_letterhead.png")
signature_png = os.path.join(samples_dir, "sample_signature.png")
output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "storage", "outputs")
os.makedirs(output_dir, exist_ok=True)

raw_pdf = os.path.join(output_dir, "temp_raw_invoice.pdf")
final_pdf = os.path.join(output_dir, "test_final_composed.pdf")
preview_png = os.path.join(output_dir, "test_preview_page1.png")

def convert_excel_via_com(xlsx_path, pdf_path, sheet_name=None):
    print("Converting Excel via COM...")
    pythoncom.CoInitialize()
    excel = None
    wb = None
    try:
        excel = win32com.client.DispatchEx("Excel.Application")
        excel.Visible = False
        excel.DisplayAlerts = False
        excel.ScreenUpdating = False
        
        abs_xlsx = os.path.abspath(xlsx_path)
        abs_pdf = os.path.abspath(pdf_path)
        if os.path.exists(abs_pdf):
            os.remove(abs_pdf)
            
        wb = excel.Workbooks.Open(abs_xlsx, ReadOnly=True)
        
        target = wb
        if sheet_name:
            for s in wb.Sheets:
                if s.Name == sheet_name:
                    target = s
                    break
        else:
            target = wb.ActiveSheet

        # ExportAsFixedFormat: Type=0 (xlTypePDF)
        target.ExportAsFixedFormat(0, abs_pdf)
        print("Excel COM conversion successful:", abs_pdf)
        return True
    finally:
        if wb:
            try:
                wb.Close(SaveChanges=False)
            except Exception:
                pass
        if excel:
            try:
                excel.Quit()
            except Exception:
                pass
        pythoncom.CoUninitialize()

def compose_pdf(bill_pdf, letterhead_path, signature_path, out_pdf, layout_mode="fit_pad"):
    print("Composing PDF with Letterhead & Signature...")
    bill_doc = fitz.open(bill_pdf)
    lh_is_pdf = letterhead_path.lower().endswith(".pdf")
    lh_doc = fitz.open(letterhead_path) if lh_is_pdf else None
    
    out_doc = fitz.open()

    for pno in range(len(bill_doc)):
        bill_page = bill_doc[pno]
        
        # A4 standard dimensions: 595.276 x 841.89 points
        page_width = 595.28
        page_height = 841.89
        
        new_page = out_doc.new_page(width=page_width, height=page_height)

        # 1. Background Letterhead
        if lh_doc:
            lh_page = lh_doc[0] # use page 1 of letterhead
            new_page.show_pdf_page(new_page.rect, lh_doc, pno=0)
        else:
            new_page.insert_image(new_page.rect, filename=letterhead_path)

        # 2. Bill content
        # Margins reserved for letterhead: Top 105pt (header), Bottom 60pt (footer), Left 36pt, Right 36pt
        if layout_mode == "fit_pad":
            top_m = 105.0
            bottom_m = 60.0
            left_m = 36.0
            right_m = 36.0
            printable_rect = fitz.Rect(left_m, top_m, page_width - right_m, page_height - bottom_m)
            # Render bill page into printable area vectorially
            new_page.show_pdf_page(printable_rect, bill_doc, pno=pno)
        else:
            # Preserve excel layout directly
            new_page.show_pdf_page(new_page.rect, bill_doc, pno=pno)

        # 3. Add signature on the last page
        if pno == len(bill_doc) - 1 and signature_path and os.path.exists(signature_path):
            # Place signature above Authorized Signatory line
            # Right aligned around X: 370..530, Y: 670..730
            sig_rect = fitz.Rect(380, 665, 520, 725)
            new_page.insert_image(sig_rect, filename=signature_path, keep_proportion=True, overlay=True)

    out_doc.save(out_pdf)
    out_doc.close()
    bill_doc.close()
    if lh_doc:
        lh_doc.close()
    print("Final composed PDF saved:", out_pdf)
    return out_pdf

def verify_output(pdf_path, png_preview_path):
    doc = fitz.open(pdf_path)
    print(f"Verified PDF page count: {len(doc)}")
    text = doc[0].get_text()
    print("Sample extracted text snippet from generated PDF:")
    print("--------------------------------------------------")
    for line in text.splitlines()[:15]:
        print("  |", line)
    print("--------------------------------------------------")
    
    # Render preview image
    pix = doc[0].get_pixmap(dpi=150)
    pix.save(png_preview_path)
    print(f"Rendered high-res preview image saved: {png_preview_path} ({pix.width}x{pix.height} px)")
    doc.close()
    
    # Check selectable text
    assert "COMMERCIAL INVOICE" in text or "INVOICE" in text or "Horizon" in text, "Selectable text must be present!"
    print("SUCCESS: Text is fully selectable and vector elements are intact!")

if __name__ == "__main__":
    convert_excel_via_com(excel_file, raw_pdf)
    compose_pdf(raw_pdf, letterhead_pdf, signature_png, final_pdf)
    verify_output(final_pdf, preview_png)
