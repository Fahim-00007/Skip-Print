"""
Generate sample Excel bills, letterheads (PDF and PNG), and transparent PNG signatures.
"""
import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from PIL import Image, ImageDraw, ImageFont

samples_dir = os.path.dirname(os.path.abspath(__file__))

def create_sample_excel():
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Tax Invoice"
    
    # Ensure grid lines are visible
    ws.views.sheetView[0].showGridLines = True
    
    # Page setup for A4
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.orientation = ws.ORIENTATION_PORTRAIT
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True

    # Column widths
    widths = {'A': 6, 'B': 30, 'C': 12, 'D': 14, 'E': 16}
    for col, w in widths.items():
        ws.column_dimensions[col].width = w

    # Fonts & Styles
    navy = "1E3A8A"
    gray = "F3F4F6"
    title_font = Font(name="Segoe UI", size=16, bold=True, color="1E3A8A")
    subtitle_font = Font(name="Segoe UI", size=10, color="4B5563")
    bold_font = Font(name="Segoe UI", size=10, bold=True, color="111827")
    regular_font = Font(name="Segoe UI", size=10, color="1F2937")
    header_font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
    
    header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    alt_fill = PatternFill(start_color="F9FAFB", end_color="F9FAFB", fill_type="solid")
    total_fill = PatternFill(start_color="EFF6FF", end_color="EFF6FF", fill_type="solid")

    thin_border_side = Side(style='thin', color='D1D5DB')
    double_bottom_side = Side(style='double', color='1E3A8A')
    box_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
    total_border = Border(top=thin_border_side, bottom=double_bottom_side)

    # Document Header
    ws.merge_cells('A2:E2')
    ws['A2'] = "COMMERCIAL INVOICE"
    ws['A2'].font = title_font
    ws['A2'].alignment = Alignment(horizontal='center', vertical='center')
    ws.row_dimensions[2].height = 28

    ws.merge_cells('A3:E3')
    ws['A3'] = "Original For Recipient | GST/VAT Compliant"
    ws['A3'].font = subtitle_font
    ws['A3'].alignment = Alignment(horizontal='center', vertical='center')

    # Invoice Details Block
    ws['A5'] = "Invoice No:"
    ws['A5'].font = bold_font
    ws['B5'] = "INV-2026-0842"
    ws['B5'].font = regular_font

    ws['D5'] = "Invoice Date:"
    ws['D5'].font = bold_font
    ws['E5'] = "18-Oct-2026"
    ws['E5'].font = regular_font
    ws['E5'].alignment = Alignment(horizontal='right')

    ws['A6'] = "Due Date:"
    ws['A6'].font = bold_font
    ws['B6'] = "02-Nov-2026"
    ws['B6'].font = regular_font

    ws['D6'] = "Payment Terms:"
    ws['D6'].font = bold_font
    ws['E6'] = "Net 15 Days"
    ws['E6'].font = regular_font
    ws['E6'].alignment = Alignment(horizontal='right')

    # Bill To Block
    ws['A8'] = "Billed To:"
    ws['A8'].font = bold_font
    ws['B8'] = "Horizon Global Enterprises Ltd."
    ws['B8'].font = bold_font
    ws['B9'] = "450 Innovation Parkway, Suite 800"
    ws['B9'].font = regular_font
    ws['B10'] = "San Francisco, CA 94107"
    ws['B10'].font = regular_font
    ws['B11'] = "Attn: Accounts Payable (finance@horizonglobal.com)"
    ws['B11'].font = regular_font

    # Line Items Table Header
    headers = ["#", "Item Description", "Qty", "Unit Price", "Total (USD)"]
    ws.row_dimensions[13].height = 24
    for idx, (col_letter, text) in enumerate(zip(['A', 'B', 'C', 'D', 'E'], headers), start=1):
        cell = ws[f"{col_letter}13"]
        cell.value = text
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal='center' if col_letter in ['A', 'C'] else ('right' if col_letter in ['D', 'E'] else 'left'), vertical='center')

    # Line Items Data
    items = [
        (1, "Enterprise Cloud Architecture Consulting", 40, 150.00),
        (2, "Custom API Integration & Microservices", 25, 120.00),
        (3, "Automated CI/CD Pipeline Implementation", 15, 110.00),
        (4, "High-Availability Database Clustering", 20, 140.00),
        (5, "Security Audit & Vulnerability Assessment", 1, 1850.00),
        (6, "Dedicated Premium Support (Monthly SLA)", 1, 950.00),
    ]

    current_row = 14
    for item in items:
        ws.row_dimensions[current_row].height = 20
        num, desc, qty, rate = item
        ws[f"A{current_row}"] = num
        ws[f"A{current_row}"].alignment = Alignment(horizontal='center')
        ws[f"B{current_row}"] = desc
        ws[f"C{current_row}"] = qty
        ws[f"C{current_row}"].alignment = Alignment(horizontal='center')
        ws[f"D{current_row}"] = rate
        ws[f"D{current_row}"].number_format = "$#,##0.00"
        ws[f"D{current_row}"].alignment = Alignment(horizontal='right')
        ws[f"E{current_row}"] = f"=C{current_row}*D{current_row}"
        ws[f"E{current_row}"].number_format = "$#,##0.00"
        ws[f"E{current_row}"].alignment = Alignment(horizontal='right')

        for c in ['A', 'B', 'C', 'D', 'E']:
            ws[f"{c}{current_row}"].border = box_border
            ws[f"{c}{current_row}"].font = regular_font
            if (current_row % 2) == 1:
                ws[f"{c}{current_row}"].fill = alt_fill

        current_row += 1

    # Totals Section
    current_row += 1
    # Subtotal
    ws[f"D{current_row}"] = "Subtotal:"
    ws[f"D{current_row}"].font = bold_font
    ws[f"D{current_row}"].alignment = Alignment(horizontal='right')
    ws[f"E{current_row}"] = f"=SUM(E14:E{current_row-2})"
    ws[f"E{current_row}"].font = bold_font
    ws[f"E{current_row}"].number_format = "$#,##0.00"
    ws[f"E{current_row}"].alignment = Alignment(horizontal='right')
    current_row += 1

    # Tax (8.5%)
    ws[f"D{current_row}"] = "Tax / VAT (8.5%):"
    ws[f"D{current_row}"].font = regular_font
    ws[f"D{current_row}"].alignment = Alignment(horizontal='right')
    ws[f"E{current_row}"] = f"=E{current_row-1}*0.085"
    ws[f"E{current_row}"].font = regular_font
    ws[f"E{current_row}"].number_format = "$#,##0.00"
    ws[f"E{current_row}"].alignment = Alignment(horizontal='right')
    current_row += 1

    # Grand Total
    ws.row_dimensions[current_row].height = 24
    ws[f"D{current_row}"] = "Total Due (USD):"
    ws[f"D{current_row}"].font = Font(name="Segoe UI", size=11, bold=True, color="1E3A8A")
    ws[f"D{current_row}"].alignment = Alignment(horizontal='right', vertical='center')
    ws[f"E{current_row}"] = f"=E{current_row-2}+E{current_row-1}"
    ws[f"E{current_row}"].font = Font(name="Segoe UI", size=11, bold=True, color="1E3A8A")
    ws[f"E{current_row}"].number_format = "$#,##0.00"
    ws[f"E{current_row}"].alignment = Alignment(horizontal='right', vertical='center')
    ws[f"D{current_row}"].border = total_border
    ws[f"E{current_row}"].border = total_border
    ws[f"D{current_row}"].fill = total_fill
    ws[f"E{current_row}"].fill = total_fill

    # Banking Notes & Authorized Signatory Area
    current_row += 3
    ws[f"A{current_row}"] = "Bank Wire Transfer Details:"
    ws[f"A{current_row}"].font = bold_font
    ws[f"A{current_row+1}"] = "Bank: Pacific National Commercial Bank"
    ws[f"A{current_row+1}"].font = regular_font
    ws[f"A{current_row+2}"] = "Routing / ABA: 121000358"
    ws[f"A{current_row+2}"].font = regular_font
    ws[f"A{current_row+3}"] = "Account No: 9874-4501-9238"
    ws[f"A{current_row+3}"].font = regular_font
    ws[f"A{current_row+4}"] = "SWIFT/BIC: PNCBUS33SF"
    ws[f"A{current_row+4}"].font = regular_font

    ws[f"D{current_row}"] = "Authorized Signatory:"
    ws[f"D{current_row}"].font = bold_font
    ws[f"D{current_row}"].alignment = Alignment(horizontal='right')
    ws.merge_cells(f"D{current_row}:E{current_row}")

    ws[f"D{current_row+4}"] = "--------------------------------------"
    ws[f"D{current_row+4}"].font = regular_font
    ws[f"D{current_row+4}"].alignment = Alignment(horizontal='right')
    ws.merge_cells(f"D{current_row+4}:E{current_row+4}")

    ws[f"D{current_row+5}"] = "Alex Morgan, Managing Director"
    ws[f"D{current_row+5}"].font = bold_font
    ws[f"D{current_row+5}"].alignment = Alignment(horizontal='right')
    ws.merge_cells(f"D{current_row+5}:E{current_row+5}")

    out_path = os.path.join(samples_dir, "sample_invoice.xlsx")
    wb.save(out_path)
    print("Saved sample invoice:", out_path)
    return out_path

def create_sample_letterhead_pdf():
    out_path = os.path.join(samples_dir, "sample_letterhead.pdf")
    width, height = A4
    c = canvas.Canvas(out_path, pagesize=A4)
    
    # Draw Modern Header Letterhead
    # Top decorative colored bars
    c.setFillColor(colors.HexColor("#1E3A8A")) # Deep Blue
    c.rect(0, height - 16, width, 16, fill=True, stroke=False)
    
    c.setFillColor(colors.HexColor("#3B82F6")) # Accent Blue
    c.rect(0, height - 20, width, 4, fill=True, stroke=False)

    # Logo Emblem (Geometric shape with letter A)
    c.setFillColor(colors.HexColor("#1E3A8A"))
    c.roundRect(40, height - 85, 48, 48, 8, fill=True, stroke=False)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 26)
    c.drawString(54, height - 73, "A")

    # Company Name & Details (Header Right)
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 18)
    c.drawString(100, height - 60, "APEX DYNAMICS INC.")
    
    c.setFont("Helvetica", 9)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawString(100, height - 74, "Next-Generation Technology & Enterprise Engineering Solutions")

    # Contact details on the right
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawRightString(width - 40, height - 52, "Tel: +1 (800) 555-0199")
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawRightString(width - 40, height - 64, "Email: contact@apexdynamics.io")
    c.drawRightString(width - 40, height - 76, "HQ: 750 Tech Boulevard, Suite 400, Austin, TX 78701")

    # Thin separator line under header
    c.setStrokeColor(colors.HexColor("#E2E8F0"))
    c.setLineWidth(1)
    c.line(40, height - 95, width - 40, height - 95)

    # Watermark background emblem in center (subtle, very low opacity)
    # Using light gray outline
    c.saveState()
    c.setStrokeColor(colors.HexColor("#F1F5F9"))
    c.setLineWidth(4)
    c.circle(width / 2, height / 2, 110, fill=False, stroke=True)
    c.setFont("Helvetica-Bold", 72)
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.drawCentredString(width / 2, height / 2 - 25, "APEX")
    c.restoreState()

    # Footer
    c.setStrokeColor(colors.HexColor("#E2E8F0"))
    c.setLineWidth(1)
    c.line(40, 50, width - 40, 50)

    c.setFont("Helvetica", 8)
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.drawString(40, 36, "Apex Dynamics Inc. | Registered in Delaware | EIN: 84-2910482 | www.apexdynamics.io")
    c.drawRightString(width - 40, 36, "Confidential & Proprietary")

    # Bottom edge accent
    c.setFillColor(colors.HexColor("#1E3A8A"))
    c.rect(0, 0, width, 6, fill=True, stroke=False)

    c.showPage()
    c.save()
    print("Saved sample letterhead PDF:", out_path)
    return out_path

def create_sample_letterhead_png():
    out_path = os.path.join(samples_dir, "sample_letterhead.png")
    # Render at 150 DPI for A4 (1240 x 1754 px)
    w, h = 1240, 1754
    img = Image.new("RGBA", (w, h), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Header top bar
    draw.rectangle([0, 0, w, 32], fill=(30, 58, 138, 255))
    draw.rectangle([0, 32, w, 40], fill=(59, 130, 246, 255))

    # Logo box
    draw.rounded_rectangle([80, 70, 180, 170], radius=16, fill=(30, 58, 138, 255))
    # Draw letter A
    draw.text((115, 85), "A", fill=(255, 255, 255, 255), font_size=55)

    # Texts
    draw.text((210, 85), "APEX DYNAMICS INC.", fill=(15, 23, 42, 255), font_size=38)
    draw.text((210, 135), "Next-Generation Technology & Enterprise Engineering Solutions", fill=(100, 116, 139, 255), font_size=18)

    # Right contact
    draw.text((w - 450, 85), "Tel: +1 (800) 555-0199", fill=(51, 65, 85, 255), font_size=18)
    draw.text((w - 450, 112), "Email: contact@apexdynamics.io", fill=(100, 116, 139, 255), font_size=18)
    draw.text((w - 450, 139), "Austin, TX 78701 USA", fill=(100, 116, 139, 255), font_size=18)

    # Line
    draw.line([80, 195, w - 80, 195], fill=(226, 232, 240, 255), width=2)

    # Footer
    draw.line([80, h - 90, w - 80, h - 90], fill=(226, 232, 240, 255), width=2)
    draw.text((80, h - 65), "Apex Dynamics Inc. | EIN: 84-2910482 | www.apexdynamics.io", fill=(148, 163, 184, 255), font_size=16)
    draw.text((w - 320, h - 65), "Confidential & Proprietary", fill=(148, 163, 184, 255), font_size=16)
    draw.rectangle([0, h - 12, w, h], fill=(30, 58, 138, 255))

    img.save(out_path, "PNG")
    print("Saved sample letterhead PNG:", out_path)
    return out_path

def create_sample_signature():
    out_path = os.path.join(samples_dir, "sample_signature.png")
    # Transparent PNG
    w, h = 400, 160
    img = Image.new("RGBA", (w, h), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    # Draw realistic stylized signature curves
    ink_color = (20, 35, 90, 235) # Elegant dark blue ink
    
    # A stylized "Alex Morgan" flourish
    points = [
        (30, 110), (45, 45), (65, 35), (85, 120), (105, 50), (120, 80), (145, 75),
        (165, 85), (185, 50), (195, 30), (210, 120), (225, 90), (245, 95),
        (265, 70), (285, 95), (310, 75), (340, 80), (370, 70)
    ]
    # Draw smooth spline-like strokes
    for i in range(len(points) - 1):
        draw.line([points[i], points[i+1]], fill=ink_color, width=4)
        
    # Add energetic underline flourish
    flourish = [(35, 125), (120, 130), (220, 132), (320, 128), (375, 115)]
    for i in range(len(flourish) - 1):
        draw.line([flourish[i], flourish[i+1]], fill=ink_color, width=3)

    img.save(out_path, "PNG")
    print("Saved sample transparent signature:", out_path)
    return out_path

if __name__ == "__main__":
    create_sample_excel()
    create_sample_letterhead_pdf()
    create_sample_letterhead_png()
    create_sample_signature()
