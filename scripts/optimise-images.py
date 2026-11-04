"""Turns approved source photos in assets/ into WebP sizes in public/media/.
Run: python3 scripts/optimise-images.py"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "media"
OUT.mkdir(parents=True, exist_ok=True)

# name -> source. Only photos approved in CONTENT.md.
# The lifestyle and "In good company" photos were removed at the owner's request (Nov 2026).
PHOTOS = {
    "portrait": "assets/linkedin-portrait-800.jpg",
}
WIDTHS = [480, 960, 1440]

for name, src in PHOTOS.items():
    im = ImageOps.exif_transpose(Image.open(ROOT / src)).convert("RGB")
    sizes = [w for w in WIDTHS if w <= im.width]
    if im.width < WIDTHS[-1] and im.width not in sizes:
        sizes.append(im.width)  # keep the native size of smaller sources
    for w in sizes:
        h = round(im.height * w / im.width)
        im.resize((w, h), Image.LANCZOS).save(OUT / f"{name}-{w}.webp", "WEBP", quality=80, method=6)
    print(name, im.size)
