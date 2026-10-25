"""
Signature styling and date annotation service.
Generates realistic handwritten dates alongside signatures using matching ink color and natural pen stroke.
"""
import os
import hashlib
from PIL import Image, ImageDraw, ImageFont
from backend.paths import OUTPUTS_DIR, BACKEND_DIR

FONTS_DIR = os.path.join(BACKEND_DIR, "assets", "fonts")

def find_handwriting_font(size: int = 24):
    """
    Finds the best available realistic handwriting font.
    Prefers bundled Segoe Script Bold or Dancing Script Bold, falling back to system fonts.
    """
    candidates = [
        os.path.join(FONTS_DIR, "segoescb.ttf"),
        os.path.join(FONTS_DIR, "DancingScript-Bold.ttf"),
        os.path.join(FONTS_DIR, "segoesc.ttf"),
        os.path.join(FONTS_DIR, "DancingScript-Regular.ttf"),
        r"C:\Windows\Fonts\segoescb.ttf",
        r"C:\Windows\Fonts\segoesc.ttf",
        r"C:\Windows\Fonts\DancingScript-Bold.ttf",
        r"C:\Windows\Fonts\Inkfree.ttf",
        r"C:\Windows\Fonts\segoeprb.ttf",
        r"C:\Windows\Fonts\segoepr.ttf",
    ]

    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue

    return ImageFont.load_default()

def detect_signature_ink(sig_img: Image.Image) -> tuple:
    """
    Detects the dominant pen ink color from the signature image.
    Returns RGBA tuple, e.g. (20, 35, 90, 240) for classic blue ballpoint ink.
    """
    sw, sh = sig_img.size
    pixels = sig_img.load()
    colors = {}

    for y in range(0, sh, 2):
        for x in range(0, sw, 2):
            r, g, b, a = pixels[x, y]
            # Ignore transparent or near-white background pixels
            if a > 130 and (r < 220 or g < 220 or b < 220):
                k = (r, g, b)
                colors[k] = colors.get(k, 0) + 1

    if colors:
        dominant_rgb = sorted(colors.items(), key=lambda item: item[1], reverse=True)[0][0]
    else:
        dominant_rgb = (20, 35, 90) # Classic deep blue ink

    return (dominant_rgb[0], dominant_rgb[1], dominant_rgb[2], 245)

def get_dated_signature_path(sig_path: str, date_text: str) -> str:
    """
    Composes a signature PNG with a matching handwritten date directly underneath.
    Caches the generated image for instant repeat retrieval.
    """
    if not sig_path or not os.path.exists(sig_path) or not date_text or not str(date_text).strip():
        return sig_path

    date_str = str(date_text).strip()

    # Create distinct cache hash
    file_stat = os.stat(sig_path)
    cache_str = f"{sig_path}_{file_stat.st_mtime}_{date_str}"
    cache_hash = hashlib.md5(cache_str.encode("utf-8")).hexdigest()

    cached_file = os.path.join(OUTPUTS_DIR, f"dated_sig_{cache_hash}.png")
    if os.path.exists(cached_file) and os.path.getsize(cached_file) > 500:
        return cached_file

    sig_img = Image.open(sig_path).convert("RGBA")
    sw, sh = sig_img.size

    ink_color = detect_signature_ink(sig_img)

    # Choose font size proportional to signature height
    font_size = max(18, min(36, int(sh * 0.22)))
    font = find_handwriting_font(font_size)

    # Measure text bounding box
    dummy = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    bbox = dummy.textbbox((0, 0), date_str, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]

    gap = max(4, int(sh * 0.04))
    canvas_w = max(sw, tw + 50)
    canvas_h = sh + th + gap + 10

    canvas = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 0))
    sig_x = (canvas_w - sw) // 2
    canvas.paste(sig_img, (sig_x, 0), sig_img)

    draw = ImageDraw.Draw(canvas)
    # Position: placed naturally aligned under the right side of the signature flourish
    date_x = max(20, sig_x + sw - tw - 25)
    date_y = sh + gap

    # Render with 1px stroke to simulate authentic pen pressure
    draw.text(
        (date_x, date_y),
        date_str,
        fill=ink_color,
        font=font,
        stroke_width=1,
        stroke_fill=ink_color
    )

    canvas.save(cached_file, "PNG")
    return cached_file
