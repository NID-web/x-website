#!/usr/bin/env python3
"""Decode the four animation frames of each craft pattern field from Figma.

Source : design/assets/patterns/frames/patternimate{1,2,3}.png
Output : the "frames" key of design/assets/patterns/home-patterns.json

WHY A SCREENSHOT AND NOT A VECTOR EXPORT. Each field's motif is a Figma
COMPONENT SET of four 24x24 variants (`Patternimate-1/2/3`, nodes 569:40620,
671:53051, 677:41324 in file QoVWmyMWLysnbyHZk1NLqn). A variant is 24x24 px and
the motif is 24x24 CELLS, so the render is exactly ONE PIXEL PER CELL and the
PNG is a lossless description of the geometry - there is nothing a vector export
would add. The component set renders as one 56x176 strip: 16px padding, then the
four variants at y=16/56/96/136, each 24x24 at x=16.

It is checked against the geometry already in the JSON, which was extracted
independently from the Figma Make export of the Home frame. Frame 0 IS that
geometry, so the check is exact and any drift fails the run:

    PatternField1  64/64 cells   PatternField2  96/96   PatternField3  84/84

Re-derive by re-screenshotting those three nodes (Figma MCP get_screenshot,
no maxDimension - they render at natural size) into the frames/ directory.

Run with: python3 scripts/extract-pattern-frames.py
"""

import json
import os
import struct
import sys
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATTERNS = os.path.join(ROOT, "design", "assets", "patterns")
SOURCE = os.path.join(PATTERNS, "home-patterns.json")
FRAMES_DIR = os.path.join(PATTERNS, "frames")

# figma layer -> the component set's screenshot. The layer name is what the JSON
# already keys each field by; the labels do NOT line up with the numbers
# (PatternField1 comes from Patternimate-2), which is why this maps by layer.
PNG_BY_LAYER = {
    "Patternimate-1": "patternimate1.png",
    "Patternimate-2": "patternimate2.png",
    "Patternimate-3": "patternimate3.png",
}

CELLS = 24          # a motif is 24x24 cells
UNIT = 2            # ...of 2 user units each, so 48x48 user units
ORIGIN = 16         # the component set's padding
STRIDE = 40         # variant pitch down the strip
BACKGROUND = "#faffff"


def read_png(path):
    """Minimal RGBA PNG reader — enough for a 56x176 non-interlaced export, and
    it keeps this script dependency-free (Pillow is not a repo dependency)."""
    data = open(path, "rb").read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        sys.exit(f"not a PNG: {path}")
    i, idat = 8, b""
    width = height = channels = None
    while i < len(data):
        length = struct.unpack(">I", data[i : i + 4])[0]
        kind = data[i + 4 : i + 8]
        chunk = data[i + 8 : i + 8 + length]
        if kind == b"IHDR":
            width, height, _depth, colour = struct.unpack(">IIBB", chunk[:10])
            channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[colour]
        elif kind == b"IDAT":
            idat += chunk
        i += 12 + length

    raw = zlib.decompress(idat)
    stride = width * channels
    rows, prev, p = [], bytearray(stride), 0
    for _ in range(height):
        filt = raw[p]
        p += 1
        line = bytearray(raw[p : p + stride])
        p += stride
        for x in range(stride):
            a = line[x - channels] if x >= channels else 0
            b = prev[x]
            c = prev[x - channels] if x >= channels else 0
            if filt == 1:
                line[x] = (line[x] + a) & 255
            elif filt == 2:
                line[x] = (line[x] + b) & 255
            elif filt == 3:
                line[x] = (line[x] + (a + b) // 2) & 255
            elif filt == 4:
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pred = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[x] = (line[x] + pred) & 255
        rows.append(bytes(line))
        prev = line
    return width, height, channels, rows


def nearest(hexv, palette, rgb):
    """A cell drawn at a sub-cell offset antialiases between its own colour and
    the ground, so it lands off-palette. Snap it back rather than dropping it —
    the alternative loses four marks of PatternField3 (see the header)."""
    if hexv in palette:
        return hexv
    return min(
        palette,
        key=lambda p: sum((int(p[i : i + 2], 16) - c) ** 2 for i, c in zip((1, 3, 5), rgb)),
    )


def frames_of(path, palette):
    """The four variants as {(cell x, cell y): colour}."""
    _w, _h, channels, rows = read_png(path)
    out = []
    for v in range(4):
        top = ORIGIN + STRIDE * v
        cells = {}
        for cy in range(CELLS):
            for cx in range(CELLS):
                x = (ORIGIN + cx) * channels
                r, g, b, alpha = rows[top + cy][x : x + 4]
                if alpha < 40:
                    continue
                hexv = "#%02x%02x%02x" % (r, g, b)
                if hexv == BACKGROUND:
                    continue
                cells[(cx, cy)] = nearest(hexv, palette, (r, g, b))
        out.append(cells)
    return out


def merge(cells, colour):
    """Cells of one colour as maximal rectangles, in the [x, y, w, h] user-unit
    form the JSON already uses: runs merged along x, then equal runs down y."""
    own = sorted(k for k, v in cells.items() if v == colour)
    todo = set(own)
    runs = []
    for (cx, cy) in own:
        if (cx, cy) not in todo:
            continue
        width = 0
        while (cx + width, cy) in todo:
            width += 1
        height = 1
        while all((cx + i, cy + height) in todo for i in range(width)):
            height += 1
        for i in range(width):
            for j in range(height):
                todo.discard((cx + i, cy + j))
        runs.append([cx * UNIT, cy * UNIT, width * UNIT, height * UNIT])
    return runs


def main():
    doc = json.load(open(SOURCE, encoding="utf-8"))
    failures = []

    for field in doc["fields"]:
        layer = field["figmaLayer"]
        png = PNG_BY_LAYER.get(layer)
        if not png:
            continue
        palette = list(field["rects"])
        decoded = frames_of(os.path.join(FRAMES_DIR, png), palette)

        # Frame 0 must reproduce the geometry already in the file, cell for cell.
        known = {}
        for hexv, rects in field["rects"].items():
            for (x, y, w, h) in rects:
                for cx in range(x // UNIT, (x + w) // UNIT):
                    for cy in range(y // UNIT, (y + h) // UNIT):
                        known[(cx, cy)] = hexv
        agree = sum(1 for k, v in known.items() if decoded[0].get(k) == v)
        status = "ok" if agree == len(known) else "MISMATCH"
        if agree != len(known):
            failures.append(f"{field['label']}: frame 0 differs from rects ({agree}/{len(known)})")
        print(f"  {field['label']:15s} <- {layer:16s} frame 0 {agree}/{len(known)} cells {status}")

        field["frames"] = [
            {colour: merge(cells, colour) for colour in palette if merge(cells, colour)}
            for cells in decoded
        ]

    if failures:
        sys.exit("\n".join(["FAILED:"] + failures))

    with open(SOURCE, "w", encoding="utf-8") as fh:
        json.dump(doc, fh, indent=1)
        fh.write("\n")
    print(f"\nwrote frames into {os.path.relpath(SOURCE, ROOT)}")


if __name__ == "__main__":
    main()
