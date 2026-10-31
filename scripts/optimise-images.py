"""Turns approved source photos in assets/ into WebP sizes in public/media/.
Run: python3 scripts/optimise-images.py"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "media"
OUT.mkdir(parents=True, exist_ok=True)

# name -> source. Only photos approved in CONTENT.md.
PHOTOS = {
    "portrait": "assets/linkedin-portrait-800.jpg",
    "lounge-cream": "assets/instagram/hd/Da7t0LWMKy2.jpg",
    "lounge-teal": "assets/instagram/hd/C71qCQCPmai.jpg",
    "terrace-coat": "assets/instagram/hd/DCttOEKPtkg.jpg",
    "london-sofa": "assets/instagram/hd/DHioSA1NuG6.jpg",
    "singapore": "assets/instagram/hd/DKRdxlJBMVy.jpg",
    "office": "assets/instagram/hd/DQgNi0XjCOj.jpg",
    "london-street": "assets/instagram/hd/DGV68BCPdZo.jpg",
    "london-lawn": "assets/instagram/hd/DGYZ0dLPnLv.jpg",
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
