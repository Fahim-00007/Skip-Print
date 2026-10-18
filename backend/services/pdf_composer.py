"""
PDF Composition Service.
Overlays Excel bill vector content onto company letterhead templates, adds signatures,
and renders custom text annotations.
Maintains 100% selectable text, sharp vector graphics, and transparent PNG signatures.
"""
import os
import pymupdf as fitz
import base64
from reportlab.lib.pagesizes import A4, letter

PAPER_DIMS = {
    "A4": (595.28, 841.89),
    "Letter": (612.0, 792.0)
}

def hex_to_rgb_tuple(hex_str: str):
    if not hex_str:
        return (0, 0, 0)
    hex_clean = hex_str.lstrip("#")
    if len(hex_clean) == 6:
        r = int(hex_clean[0:2], 16) / 255.0
        g = int(hex_clean[2:4], 16) / 255.0
        b = int(hex_clean[4:6], 16) / 255.0
        return (r, g, b)
    return (0, 0, 0)

def compose_document(
    bill_pdf_path: str,
    template_path: str,
    output_pdf_path: str,
    layout_mode: str = "fit_pad", # "fit_pad" or "preserve"
    paper_size: str = "A4",
    orientation: str = "portrait",
    margin_top: float = 105.0,
    margin_bottom: float = 60.0,
    margin_left: float = 36.0,
    margin_right: float = 36.0,
    scale_factor: float = 1.0,
    offset_x: float = 0.0,
    offset_y: float = 0.0,
    repeat_letterhead: bool = True,
    signature_path: str = None,
    signature_page: str = "last", # "all", "last", or 1-based index str
    signature_coords: dict = None, # { x, y, width, height, opacity, rotation }
    annotations: list = None # List of TextAnnotation dicts
) -> dict:
    """
    Composes the multi-page vector PDF with letterhead background, scaled bill content,
    signatures, and live text annotations.
    """
    if not os.path.exists(bill_pdf_path):
        raise FileNotFoundError(f"Bill PDF not found: {bill_pdf_path}")

    base_w, base_h = PAPER_DIMS.get(paper_size, (595.28, 841.89))
    if orientation == "landscape":
        page_width, page_height = max(base_w, base_h), min(base_w, base_h)
    else:
        page_width, page_height = min(base_w, base_h), max(base_w, base_h)

    bill_doc = fitz.open(bill_pdf_path)
    total_bill_pages = len(bill_doc)

    lh_is_pdf = bool(template_path and template_path.lower().endswith(".pdf") and os.path.exists(template_path))
    lh_doc = fitz.open(template_path) if lh_is_pdf else None
    lh_is_image = bool(template_path and not lh_is_pdf and os.path.exists(template_path))

    out_doc = fitz.open()

    for pno in range(total_bill_pages):
        page_num_1based = pno + 1
        new_page = out_doc.new_page(width=page_width, height=page_height)

        # 1. Underlay Letterhead
        should_render_lh = (pno == 0) or repeat_letterhead
        if should_render_lh:
            if lh_doc:
                lh_pno = min(pno, len(lh_doc) - 1)
                new_page.show_pdf_page(new_page.rect, lh_doc, pno=lh_pno)
            elif lh_is_image:
                new_page.insert_image(new_page.rect, filename=template_path)

        # 2. Render Bill Content Vectorially
        if layout_mode == "fit_pad":
            base_rect = fitz.Rect(
                margin_left + offset_x,
                margin_top + offset_y,
                page_width - margin_right + offset_x,
                page_height - margin_bottom + offset_y
            )

            if scale_factor != 1.0:
                cx = (base_rect.x0 + base_rect.x1) / 2
                cy = (base_rect.y0 + base_rect.y1) / 2
                half_w = (base_rect.width * scale_factor) / 2
                half_h = (base_rect.height * scale_factor) / 2
                target_rect = fitz.Rect(cx - half_w, cy - half_h, cx + half_w, cy + half_h)
            else:
                target_rect = base_rect

            new_page.show_pdf_page(target_rect, bill_doc, pno=pno, keep_proportion=True)
        else:
            content_rect = fitz.Rect(offset_x, offset_y, page_width + offset_x, page_height + offset_y)
            new_page.show_pdf_page(content_rect, bill_doc, pno=pno, keep_proportion=True)

        # 3. Add Signature
        if signature_path and os.path.exists(signature_path) and signature_coords:
            is_sig_page = False
            if signature_page == "all":
                is_sig_page = True
            elif signature_page == "last" and page_num_1based == total_bill_pages:
                is_sig_page = True
            elif str(signature_page) == str(page_num_1based):
                is_sig_page = True

            if is_sig_page:
                sx = float(signature_coords.get("x", 380))
                sy = float(signature_coords.get("y", 680))
                sw = float(signature_coords.get("width", 140))
                sh = float(signature_coords.get("height", 60))

                if sx <= 1.0 and sy <= 1.0:
                    sx = sx * page_width
                    sy = sy * page_height
                    sw = (sw * page_width) if sw <= 1.0 else sw
                    sh = (sh * page_height) if sh <= 1.0 else sh

                sig_rect = fitz.Rect(sx, sy, sx + sw, sy + sh)
                rot = int(signature_coords.get("rotation", 0))

                new_page.insert_image(
                    sig_rect,
                    filename=signature_path,
                    keep_proportion=True,
                    overlay=True,
                    rotate=rot
                )

        # 4. Add Text Annotations (Custom editable text blocks)
        if annotations:
            for ann in annotations:
                ann_dict = ann if isinstance(ann, dict) else ann.model_dump()
                ann_page = str(ann_dict.get("page", "all"))
                
                is_ann_page = False
                if ann_page == "all":
                    is_ann_page = True
                elif ann_page == "last" and page_num_1based == total_bill_pages:
                    is_ann_page = True
                elif ann_page == str(page_num_1based):
                    is_ann_page = True

                if is_ann_page:
                    ax = float(ann_dict.get("x", 50))
                    ay = float(ann_dict.get("y", 50))
                    aw = float(ann_dict.get("width", 180))
                    ah = float(ann_dict.get("height", 36))
                    text_str = str(ann_dict.get("text", ""))
                    f_size = float(ann_dict.get("font_size", 12))
                    f_color = hex_to_rgb_tuple(ann_dict.get("font_color", "#1E3A8A"))
                    is_bold = bool(ann_dict.get("is_bold", False))
                    fontname = "hebo" if is_bold else "helv"
                    rot = int(ann_dict.get("rotation", 0))

                    ann_rect = fitz.Rect(ax, ay, ax + aw, ay + ah)
                    new_page.insert_textbox(
                        ann_rect,
                        text_str,
                        fontsize=f_size,
                        fontname=fontname,
                        color=f_color,
                        rotate=rot
                    )

    os.makedirs(os.path.dirname(os.path.abspath(output_pdf_path)), exist_ok=True)
    out_doc.save(output_pdf_path)
    out_doc.close()
    bill_doc.close()
    if lh_doc:
        lh_doc.close()

    return {
        "success": True,
        "output_path": output_pdf_path,
        "total_pages": total_bill_pages,
        "file_size": os.path.getsize(output_pdf_path)
    }

def render_page_preview_data_url(pdf_path: str, page_number: int = 1, dpi: int = 140) -> str:
    """
    Renders a given page of a PDF directly to a base64 PNG data URL for live UI display.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    doc = fitz.open(pdf_path)
    if len(doc) == 0:
        doc.close()
        raise ValueError("PDF has no pages.")

    idx = max(0, min(page_number - 1, len(doc) - 1))
    page = doc[idx]
    pix = page.get_pixmap(dpi=dpi)
    png_bytes = pix.tobytes("png")
    doc.close()

    b64_str = base64.b64encode(png_bytes).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"
