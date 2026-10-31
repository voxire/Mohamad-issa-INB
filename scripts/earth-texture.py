"""Grades NASA's Black Marble 2016 (public domain, NASA Earth Observatory) into the globe texture.

Source: assets/earth/black-marble-2016.jpg (3600x1800, eoimages.gsfc.nasa.gov, record 144898)
Output: public/media/earth-night-2048.webp (equirectangular, 2048x1024)

The purple-blue land of the original becomes a quiet charcoal, and the city lights become
his warm beige, so the earth sits on the page in the brief's palette.
"""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
src = Image.open(ROOT / "assets/earth/black-marble-2016.jpg").convert("RGB").resize((2048, 1024), Image.LANCZOS)
c = np.asarray(src).astype(np.float32) / 255.0
r, g, b = c[..., 0], c[..., 1], c[..., 2]

# City lights are yellow (red and green above blue); land and ice are blue.
lights = np.clip((0.5 * (r + g) - b) * 3.2, 0, 1) ** 0.85
land = np.clip((b - 0.035) * 2.4, 0, 1)

ocean = np.array([0.055, 0.058, 0.064])  # just above the page charcoal
ground = np.array([0.20, 0.21, 0.23])  # cool graphite for land, ice reads a little brighter
beige = np.array([1.0, 0.90, 0.72])  # warm city light, a touch hotter than #E8DCC8

out = ocean + land[..., None] * (ground - ocean) + lights[..., None] * beige * 1.15
out = np.clip(out, 0, 1)
Image.fromarray((out * 255).astype(np.uint8)).save(ROOT / "public/media/earth-night-2048.webp", quality=82, method=6)
print("ok", (ROOT / "public/media/earth-night-2048.webp").stat().st_size // 1024, "KB")
