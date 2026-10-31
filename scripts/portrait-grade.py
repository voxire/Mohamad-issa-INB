"""Hero portrait: grades the subject cut-out (transparent background) and writes
portrait-hero-*.webp with alpha. The cut-out comes from scripts/cutout.swift
(Apple Vision, on-device):  swift scripts/cutout.swift assets/linkedin-portrait-800.jpg assets/portrait-cutout.png
Run: python3 scripts/portrait-grade.py"""
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
src = Image.open(ROOT / "assets/portrait-cutout.png").convert("RGBA")
rgb, alpha = src.convert("RGB"), src.getchannel("A")

# Gentle S-curve for depth: 0→0, 40→34, 128→130, 220→228, 255→255
pts = [(0, 0), (40, 34), (128, 130), (220, 228), (255, 255)]
def curve(v):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if v <= x1:
            return round(y0 + (y1 - y0) * (v - x0) / (x1 - x0))
    return 255
rgb = rgb.point([curve(v) for v in range(256)] * 3)

# A whisper of warmth, then contrast
r, g, b = rgb.split()
r = r.point(lambda v: min(255, round(v * 1.012)))
b = b.point(lambda v: round(v * 0.985))
rgb = ImageEnhance.Contrast(Image.merge("RGB", (r, g, b))).enhance(1.05)

# Soften the matte edge by a hair so hair/shoulders don't look cut with scissors
alpha = alpha.filter(ImageFilter.GaussianBlur(0.6))
graded = Image.merge("RGBA", (*rgb.split(), alpha))

out = ROOT / "public/media"
for w in (480, 800, 1200):
    v = graded.resize((w, w), Image.LANCZOS)
    c = v.convert("RGB").filter(ImageFilter.UnsharpMask(radius=1.4 if w > 800 else 1.0, percent=70, threshold=2))
    Image.merge("RGBA", (*c.split(), v.getchannel("A"))).save(
        out / f"portrait-hero-{w}.webp", "WEBP", quality=88, method=6)
print("ok")
