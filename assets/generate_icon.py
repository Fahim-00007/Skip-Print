"""
Generate BillCraft application icons and Inno Setup wizard artwork.

Run from the project root:
    py assets/generate_icon.py
"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
os.makedirs(ASSETS, exist_ok=True)

S = 1024
FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
FONT_REGULAR = r"C:\Windows\Fonts\segoeui.ttf"


def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


def vertical_gradient(size, top, bottom):
    image = Image.new("RGB", (1, size), top)
    draw = ImageDraw.Draw(image)
    for y in range(size):
        ratio = y / max(size - 1, 1)
        color = tuple(round(top[i] + (bottom[i] - top[i]) * ratio) for i in range(3))
        draw.point((0, y), fill=color)
    return image.resize((size, size))


def diagonal_gradient(size, start, end):
    """Smooth diagonal gradient rendered at low resolution then upscaled."""
    small = 64
    image = Image.new("RGB", (small, small))
    pixels = image.load()
    for y in range(small):
        for x in range(small):
            ratio = (x + y) / (2 * (small - 1))
            pixels[x, y] = tuple(
                round(start[i] + (end[i] - start[i]) * ratio) for i in range(3)
            )
    return image.resize((size, size), Image.LANCZOS)


def rounded_mask(size, radius):
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, size - 1, size - 1), radius=radius, fill=255
    )
    return mask


def draw_icon(size=1024):
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    # Rounded gradient app tile -------------------------------------------------
    radius = int(size * 0.22)
    tile = diagonal_gradient(size, (45, 22, 115), (140, 59, 255)).convert("RGBA")
    tile.putalpha(rounded_mask(size, radius))
    image.alpha_composite(tile)

    # Soft glow accents ---------------------------------------------------------
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse(
        (-int(size * 0.25), -int(size * 0.3), int(size * 0.55), int(size * 0.5)),
        fill=(255, 255, 255, 28),
    )
    gd.ellipse(
        (int(size * 0.55), int(size * 0.55), int(size * 1.2), int(size * 1.2)),
        fill=(255, 255, 255, 18),
    )
    glow.putalpha(Image.composite(glow.getchannel("A"), glow.getchannel("A"), rounded_mask(size, radius)))
    image.alpha_composite(glow)

    # Document page -------------------------------------------------------------
    left = int(size * 0.235)
    top = int(size * 0.155)
    right = int(size * 0.745)
    bottom = int(size * 0.845)
    page_radius = int(size * 0.055)

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        (left + int(size * 0.012), top + int(size * 0.022), right + int(size * 0.012), bottom + int(size * 0.022)),
        radius=page_radius,
        fill=(15, 5, 45, 90),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(size * 0.02))
    image.alpha_composite(shadow)

    page = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pd = ImageDraw.Draw(page)
    pd.rounded_rectangle(
        (left, top, right, bottom), radius=page_radius, fill=(255, 255, 255, 255)
    )

    # Purple letterhead band ----------------------------------------------------
    band_height = int(size * 0.16)
    band = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    bd.rounded_rectangle(
        (left, top, right, top + band_height + page_radius),
        radius=page_radius,
        fill=(109, 40, 217, 255),
    )
    bd.rectangle(
        (left, top + band_height, right, top + band_height + page_radius),
        fill=(109, 40, 217, 255),
    )
    page.alpha_composite(band)

    # Small logo mark inside the band ------------------------------------------
    mark = int(size * 0.055)
    pd.rounded_rectangle(
        (left + int(size * 0.045), top + int(size * 0.038), left + int(size * 0.045) + mark, top + int(size * 0.038) + mark),
        radius=int(mark * 0.28),
        fill=(255, 255, 255, 255),
    )
    pd.line(
        [
            (left + int(size * 0.058), top + int(size * 0.066)),
            (left + int(size * 0.075), top + int(size * 0.087)),
            (left + int(size * 0.108), top + int(size * 0.048)),
        ],
        fill=(109, 40, 217, 255),
        width=int(size * 0.012),
        joint="curve",
    )
    for i, width_ratio in enumerate((0.36, 0.27, 0.31)):
        y = top + int(size * (0.225 + i * 0.055))
        pd.rounded_rectangle(
            (left + int(size * 0.055), y, left + int(size * 0.055 + size * width_ratio), y + int(size * 0.026)),
            radius=int(size * 0.013),
            fill=(206, 199, 222, 255),
        )

    # Table rows ----------------------------------------------------------------
    table_top = top + int(size * 0.43)
    row_height = int(size * 0.068)
    for row in range(3):
        y = table_top + row * row_height
        pd.rounded_rectangle(
            (left + int(size * 0.055), y, right - int(size * 0.055), y + int(size * 0.042)),
            radius=int(size * 0.012),
            fill=(242, 240, 248, 255) if row % 2 == 0 else (231, 226, 242, 255),
        )
        pd.rounded_rectangle(
            (left + int(size * 0.078), y + int(size * 0.013), left + int(size * 0.30), y + int(size * 0.026)),
            radius=int(size * 0.007),
            fill=(150, 140, 178, 255),
        )
        pd.rounded_rectangle(
            (right - int(size * 0.17), y + int(size * 0.013), right - int(size * 0.082), y + int(size * 0.026)),
            radius=int(size * 0.007),
            fill=(150, 140, 178, 255),
        )

    # Total line ----------------------------------------------------------------
    total_y = table_top + 3 * row_height + int(size * 0.035)
    pd.rounded_rectangle(
        (right - int(size * 0.235), total_y, right - int(size * 0.055), total_y + int(size * 0.034)),
        radius=int(size * 0.017),
        fill=(109, 40, 217, 255),
    )

    image.alpha_composite(page)

    # Green approval badge ------------------------------------------------------
    badge_r = int(size * 0.145)
    cx, cy = int(size * 0.725), int(size * 0.735)
    badge = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bd = ImageDraw.Draw(badge)
    bd.ellipse(
        (cx - badge_r - int(size * 0.016), cy - badge_r - int(size * 0.016), cx + badge_r + int(size * 0.016), cy + badge_r + int(size * 0.016)),
        fill=(255, 255, 255, 255),
    )
    bd.ellipse(
        (cx - badge_r, cy - badge_r, cx + badge_r, cy + badge_r),
        fill=(34, 197, 94, 255),
    )
    bd.line(
        [
            (cx - int(size * 0.072), cy + int(size * 0.002)),
            (cx - int(size * 0.018), cy + int(size * 0.056)),
            (cx + int(size * 0.078), cy - int(size * 0.052)),
        ],
        fill=(255, 255, 255, 255),
        width=int(size * 0.032),
        joint="curve",
    )
    image.alpha_composite(badge)

    return image


def save_icons(icon):
    icon_512 = icon.resize((512, 512), Image.LANCZOS)
    icon_512.save(os.path.join(ASSETS, "billcraft.png"), "PNG")

    sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (24, 24), (16, 16)]
    icon.resize((256, 256), Image.LANCZOS).save(
        os.path.join(ASSETS, "billcraft.ico"),
        format="ICO",
        sizes=sizes,
    )
    print("Wrote assets/billcraft.ico and assets/billcraft.png")


def make_wizard_images(icon):
    # Large wizard image: 164 x 314 BGR BMP (Inno Setup requirement).
    W, H = 164, 314
    large = diagonal_gradient(1, (45, 22, 115), (120, 45, 235)).resize((W, H))
    large = large.convert("RGB")
    draw = ImageDraw.Draw(large)
    draw.rectangle((0, 0, W, 6), fill=(168, 85, 247))

    logo = icon.resize((96, 96), Image.LANCZOS)
    large.paste(logo, ((W - 96) // 2, 52), logo)

    title_font = font(FONT_BOLD, 25)
    subtitle_font = font(FONT_REGULAR, 10)
    tiny_font = font(FONT_REGULAR, 8)

    title = "BillCraft"
    title_box = draw.textbbox((0, 0), title, font=title_font)
    draw.text(((W - (title_box[2] - title_box[0])) / 2, 164), title, font=title_font, fill=(255, 255, 255))

    subtitle = "Excel to Professional PDF"
    subtitle_box = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    draw.text(
        ((W - (subtitle_box[2] - subtitle_box[0])) / 2, 198),
        subtitle,
        font=subtitle_font,
        fill=(224, 214, 255),
    )

    for i, line in enumerate(("Letterheads  •  Signatures", "100% local & private")):
        box = draw.textbbox((0, 0), line, font=tiny_font)
        draw.text(((W - (box[2] - box[0])) / 2, 266 + i * 14), line, font=tiny_font, fill=(196, 181, 253))

    # Inno Setup expects BMP files; convert BGR order is handled by Pillow's BMP writer.
    large.save(os.path.join(ASSETS, "wizard-large.bmp"), "BMP")

    # Small wizard image: 55 x 55.
    small = Image.new("RGB", (55, 55), (255, 255, 255))
    small_logo = icon.resize((48, 48), Image.LANCZOS)
    small.paste(small_logo, (3, 3), small_logo)
    small.save(os.path.join(ASSETS, "wizard-small.bmp"), "BMP")
    print("Wrote assets/wizard-large.bmp and assets/wizard-small.bmp")


if __name__ == "__main__":
    base_icon = draw_icon(S)
    save_icons(base_icon)
    make_wizard_images(base_icon)
