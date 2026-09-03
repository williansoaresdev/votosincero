# -*- coding: utf-8 -*-
"""Generate PWA icon set from the source logo."""
from PIL import Image, ImageOps
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_LOGO = os.path.join(ROOT, "src", "assets", "imagens", "LogoFull.png")
OUT_DIR = os.path.join(ROOT, "icons")
os.makedirs(OUT_DIR, exist_ok=True)

src = Image.open(SRC_LOGO).convert("RGBA")

def strip_near_white_bg(img, threshold=235):
    """Turn the near-white background of the source logo transparent."""
    img = img.copy()
    data = img.getdata()
    new_data = []
    for r, g, b, a in data:
        if r >= threshold and g >= threshold and b >= threshold:
            new_data.append((r, g, b, 0))
        else:
            new_data.append((r, g, b, a))
    img.putdata(new_data)
    return img

src_transparent = strip_near_white_bg(src)

# Regular (any-purpose) icons: logo as-is, resized
regular_sizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512]
for size in regular_sizes:
    img = src_transparent.resize((size, size), Image.LANCZOS)
    name = {
        16: "favicon-16.png",
        32: "favicon-32.png",
        180: "apple-touch-icon.png",
    }.get(size, f"icon-{size}.png")
    img.save(os.path.join(OUT_DIR, name))
    print("saved", name)

# Maskable icons: need safe-zone padding (logo content within inner ~80% circle)
# Source logo already has generous padding around the diamond shape, so we add a
# bit more margin and place on a solid brand-green background for maskable use.
GREEN = (16, 122, 68, 255)  # brand green background for maskable icons

def make_maskable(size, padding_ratio=0.16):
    canvas = Image.new("RGBA", (size, size), GREEN)
    inner = int(size * (1 - 2 * padding_ratio))
    logo_resized = src_transparent.resize((inner, inner), Image.LANCZOS)
    offset = ((size - inner) // 2, (size - inner) // 2)
    canvas.alpha_composite(logo_resized, offset)
    return canvas

for size in [192, 512]:
    img = make_maskable(size)
    name = f"icon-maskable-{size}.png"
    img.save(os.path.join(OUT_DIR, name))
    print("saved", name)

# Splash/hero icon (square, transparent bg preserved) for og:image / social share
og = src.resize((512, 512), Image.LANCZOS)
og.save(os.path.join(OUT_DIR, "og-image.png"))
print("saved og-image.png")

print("Done. Icons in:", OUT_DIR)
