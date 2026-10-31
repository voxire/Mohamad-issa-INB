"""Hero portrait grade: deepens the studio backdrop toward the site's charcoal,
adds contrast and a touch of warmth, then sharpens. Writes portrait-hero-*.webp.
Run: python3 scripts/portrait-grade.py"""
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
src = Image.open(ROOT / "assets/linkedin-portrait-800.jpg").convert("RGB")

# Tone curve: 0→0, 44→19 (backdrop meets #121212), 90→78, 255→255
pts = [(0, 0), (44, 19), (90, 78), (170, 172), (255, 255)]
def curve(v):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if v <= x1:
            return round(y0 + (y1 - y0) * (v - x0) / (x1 - x0))
    return 255
lut = [curve(v) for v in range(256)]
im = src.point(lut * 3)

# Slight warmth: lift red, trim blue in the mids
r, g, b = im.split()
r = r.point(lambda v: min(255, round(v * 1.012)))
b = b.point(lambda v: round(v * 0.985))
im = Image.merge("RGB", (r, g, b))
im = ImageEnhance.Contrast(im).enhance(1.05)

out = ROOT / "public/media"
for w in (480, 800, 1200):
    size = (w, w)
    v = im.resize(size, Image.LANCZOS)
    v = v.filter(ImageFilter.UnsharpMask(radius=1.4 if w > 800 else 1.0, percent=70, threshold=2))
    v.save(out / f"portrait-hero-{w}.webp", "WEBP", quality=88, method=6)
print("ok", im.getpixel((60, 200)), im.getpixel((400, 10)))
