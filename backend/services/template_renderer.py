"""
Template rendering service.
Renders custom built letterheads to PDF and generates preview images.
"""
import os
import pymupdf as fitz
from reportlab.lib.pagesizes import A4, letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors

PAPER_SIZES = {
    "A4": A4,
    "Letter": letter
}

def render_custom_template_pdf(config: dict, output_pdf_path: str) -> str:
    """
    Renders a custom letterhead to PDF using the provided design configuration.
    """
    paper_size_name = config.get("paper_size", "A4")
    base_size = PAPER_SIZES.get(paper_size_name, A4)
    orientation = config.get("orientation", "portrait")
    
    pagesize = landscape(base_size) if orientation == "landscape" else base_size
    width, height = pagesize

    c = canvas.Canvas(output_pdf_path, pagesize=pagesize)

    primary_hex = config.get("primary_color", "#1E3A8A")
    accent_hex = config.get("accent_color", "#3B82F6")
    primary_col = colors.HexColor(primary_hex)
    accent_col = colors.HexColor(accent_hex)

    # 1. Top Decorative Bar
    c.setFillColor(primary_col)
    c.rect(0, height - 12, width, 12, fill=True, stroke=False)
    c.setFillColor(accent_col)
    c.rect(0, height - 16, width, 4, fill=True, stroke=False)

    # 2. Logo
    logo_path = config.get("logo_path")
    logo_x = 40
    logo_w = 48
    logo_h = 48
    logo_drawn = False
    
    if logo_path and os.path.exists(logo_path):
        try:
            c.drawImage(logo_path, logo_x, height - 76, width=logo_w, height=logo_h, preserveAspectRatio=True, mask='auto')
            logo_drawn = True
        except Exception as e:
            print("Could not draw logo:", e)

    text_x = (logo_x + logo_w + 16) if logo_drawn else 40

    # 3. Company Name & Tagline
    company_name = config.get("company_name", "YOUR COMPANY NAME")
    tagline = config.get("tagline", "")
    
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 16)
    c.drawString(text_x, height - 50, company_name)

    if tagline:
        c.setFont("Helvetica", 9)
        c.setFillColor(colors.HexColor("#64748B"))
        c.drawString(text_x, height - 64, tagline)

    # 4. Contact Details (Header Right)
    phone = config.get("phone", "")
    email = config.get("email", "")
    website = config.get("website", "")
    address = config.get("address", "")

    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(colors.HexColor("#334155"))
    y_contact = height - 44
    if phone:
        c.drawRightString(width - 40, y_contact, f"Tel: {phone}")
        y_contact -= 12
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.HexColor("#64748B"))
    if email:
        c.drawRightString(width - 40, y_contact, f"Email: {email}")
        y_contact -= 12
    if address:
        # short address line
        addr_line = address.split("\n")[0]
        c.drawRightString(width - 40, y_contact, addr_line)
        y_contact -= 12

    # 5. Header separator line
    c.setStrokeColor(colors.HexColor("#E2E8F0"))
    c.setLineWidth(1)
    c.line(40, height - 88, width - 40, height - 88)

    # 6. Watermark (Optional)
    watermark_text = config.get("watermark_text", "")
    if watermark_text:
        c.saveState()
        c.setFont("Helvetica-Bold", 60)
        c.setFillColor(colors.HexColor("#F8FAFC"))
        c.drawCentredString(width / 2, height / 2 - 20, watermark_text)
        c.restoreState()

    # 7. Footer
    c.setStrokeColor(colors.HexColor("#E2E8F0"))
    c.setLineWidth(1)
    c.line(40, 46, width - 40, 46)

    footer_left = config.get("footer_text", "")
    if not footer_left:
        parts = [company_name]
        tax_id = config.get("tax_id")
        if tax_id:
            parts.append(f"Tax/Reg: {tax_id}")
        if website:
            parts.append(website)
        footer_left = " | ".join(parts)

    c.setFont("Helvetica", 8)
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.drawString(40, 32, footer_left)
    
    footer_right = config.get("footer_right", "Confidential")
    c.drawRightString(width - 40, 32, footer_right)

    # Bottom colored bar
    c.setFillColor(primary_col)
    c.rect(0, 0, width, 5, fill=True, stroke=False)

    c.showPage()
    c.save()
    return output_pdf_path

def generate_preview_image(pdf_or_image_path: str, output_png_path: str, dpi: int = 120) -> str:
    """
    Renders page 1 of a PDF (or resizes an image) to a standard PNG preview thumbnail.
    """
    ext = os.path.splitext(pdf_or_image_path)[1].lower()
    os.makedirs(os.path.dirname(os.path.abspath(output_png_path)), exist_ok=True)
    
    if ext == ".pdf":
        doc = fitz.open(pdf_or_image_path)
        if len(doc) > 0:
            pix = doc[0].get_pixmap(dpi=dpi)
            pix.save(output_png_path)
        doc.close()
    else:
        # It's an image (PNG, JPG)
        from PIL import Image
        img = Image.open(pdf_or_image_path)
        img.thumbnail((800, 1130), Image.Resampling.LANCZOS)
        img.save(output_png_path, "PNG")

    return output_png_path
