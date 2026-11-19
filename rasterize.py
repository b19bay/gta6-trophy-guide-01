#!/usr/bin/env python3
"""Rasterize the draw lists written by make-shots.mjs into JPEG screenshots.

The layout, text and data all come from the app's own renderer
(app/src/shots.js); this script is only the pixel writer, using the same
DejaVu Sans family the renderer measures against. Usage:
  python3 rasterize.py /tmp/gta6-shots screenshots
"""
import json
import os
import sys
from PIL import Image, ImageDraw, ImageFont

REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
_cache = {}


def font(size, bold):
    key = (size, bold)
    if key not in _cache:
        _cache[key] = ImageFont.truetype(BOLD if bold else REG, size)
    return _cache[key]


def draw_sheet(sheet):
    img = Image.new("RGB", (sheet["width"], sheet["height"]), "#f6f3ee")
    d = ImageDraw.Draw(img)
    for op in sheet["ops"]:
        t = op["t"]
        if t == "rect":
            d.rounded_rectangle(
                [op["x"], op["y"], op["x"] + op["w"], op["y"] + op["h"]],
                radius=op.get("radius", 0), fill=op["fill"])
        elif t == "line":
            d.line([op["x1"], op["y1"], op["x2"], op["y2"]],
                   fill=op["color"], width=op.get("width", 1))
        elif t == "text":
            # anchor "ls": x is the left edge, y is the baseline — the same
            # convention the renderer's layout uses (like canvas fillText).
            d.text((op["x"], op["y"]), op["str"],
                   font=font(op["size"], op.get("bold", False)), fill=op["color"],
                   anchor="ls")
    return img


def main():
    src_dir, dst_dir = sys.argv[1], sys.argv[2]
    os.makedirs(dst_dir, exist_ok=True)
    names = {"1-cover.json": "1-cover.jpg", "2-roadmap.json": "2-roadmap.jpg",
             "3-tracker.json": "3-tracker.jpg", "4-guide.json": "4-guide.jpg"}
    for src_name, dst_name in names.items():
        with open(os.path.join(src_dir, src_name)) as f:
            sheet = json.load(f)
        img = draw_sheet(sheet)
        dst = os.path.join(dst_dir, dst_name)
        quality = 82
        while True:
            img.save(dst, "JPEG", quality=quality, optimize=True)
            size = os.path.getsize(dst)
            if size <= 256 * 1024 or quality <= 55:
                break
            quality -= 7
        print(f"{dst_name}: {img.size[0]}x{img.size[1]}, {size} bytes, quality {quality}")


if __name__ == "__main__":
    main()
