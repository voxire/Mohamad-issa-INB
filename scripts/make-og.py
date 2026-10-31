"""Builds public/media/og.jpg (1200x630) for link previews (WhatsApp, LinkedIn, iMessage).
Needs TTFs converted from @fontsource Cormorant .woff files into /tmp/f (see README)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
ROOT = Path(__file__).resolve().parent.parent
W, H = 1200, 630
BG = (18, 18, 18); INK = (232, 220, 200); ACC = (157, 184, 204); INK3 = (127, 120, 109)

canvas = Image.new("RGB", (W, H), BG)
# city poster, darkened
poster = Image.open(ROOT / "public/media/hero-poster.jpg").convert("RGB").resize((W, int(W * 720 / 1280)))
poster = ImageEnhance.Brightness(poster).enhance(0.38).crop((0, 0, W, H))
canvas.paste(poster, (0, 0))
# left-side darkening
shade = Image.new("L", (W, H))
for x in range(W):
    a = int(235 * max(0, 1 - x / (W * 0.7)))
    for y in range(0, H, 1):
        pass
    shade.paste(a, (x, 0, x + 1, H))
canvas.paste(Image.new("RGB", (W, H), BG), (0, 0), shade)
# portrait with soft mask
p = Image.open(ROOT / "assets/linkedin-portrait-800.jpg").convert("RGB").resize((600, 600))
p = ImageEnhance.Color(p).enhance(0.8)
mask = Image.new("L", (600, 600), 0)
ImageDraw.Draw(mask).ellipse((70, 10, 530, 700), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(70))
canvas.paste(p, (W - 600 - 20, H - 600 + 30), mask)

d = ImageDraw.Draw(canvas)
serif = ImageFont.truetype("/tmp/f/cg-latin-300-normal.ttf", 104)
ital = ImageFont.truetype("/tmp/f/cg-latin-300-italic.ttf", 34)
small = ImageFont.truetype("/tmp/f/cg-latin-300-normal.ttf", 22)

def spaced(x, y, text, font, fill, track):
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        x += d.textlength(ch, font=font) + track

# The Spire monogram (same geometry as components/ui.tsx, 200-unit box scaled to 60px)
def spire(ox, oy, size):
    s = size / 200
    P = lambda pts: [(ox + x * s, oy + y * s) for x, y in pts]
    d.line(P([(52, 158), (52, 62), (100, 124), (148, 62), (148, 158)]), fill=INK, width=2, joint="curve")
    d.line(P([(100, 158), (100, 40)]), fill=INK, width=2)
    for a, b in ((40, 64), (136, 160), (88, 112)):
        d.line(P([(a, 158), (b, 158)]), fill=INK, width=2)
    d.line(P([(100, 40), (100, 18)]), fill=ACC, width=1)
    d.line(P([(28, 176), (172, 176)]), fill=ACC, width=1)
spire(66, 52, 64)
spaced(72, 200, "DUBAI REAL ESTATE  |  INVESTMENT ADVISORY", small, ACC, 4.2)
spaced(66, 238, "MOHAMAD", serif, INK, 4)
spaced(66, 340, "ISSA", serif, INK, 4)
d.text((72, 480), "A decade of experience. A personal approach", font=ital, fill=INK)
d.text((72, 520), "to property investment.", font=ital, fill=INK)
d.line((72, 586, 112, 586), fill=ACC, width=1)
spaced(126, 574, "MOHAMADISSA.COM", small, INK3, 4)
canvas.save(ROOT / "public/media/og.jpg", quality=88)
print("ok")
