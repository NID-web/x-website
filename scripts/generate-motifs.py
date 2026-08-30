#!/usr/bin/env python3
"""Convert the ten craft motif PNGs into token-bound SVG components.

Source of record : design/assets/motifs/<Theme>.png   (32x32, exported from
                   Figma `Motif/<Theme>`, 3225:49127 - 3225:53279)
Output           : src/components/header/motifs/<theme>.tsx

Why a conversion instead of shipping the PNGs
---------------------------------------------
The exports are pixel art: alpha is strictly 0 or 255 and every opaque pixel is
one of 2-5 colours, so the vectorisation below is LOSSLESS - the SVG renders
pixel-identical to the PNG at 32px, and stays sharp above it (the exports are
1x, so a raster would be soft on any retina display).

More importantly, every colour in every motif resolves exactly to a step of its
own theme's ramp, and those steps are the LIGHT-appearance accent semantics
(primary-450, secondary-350, tertiary-300, quaternary-250, pentenary-300). Baked
into a PNG they would stay light-mode coloured in all ten dark themes. Emitted as
`var(--nid-accent-*)` they follow both axes for free - which is what
design/NID-CONTEXT.md 3.5 asks for ("each row's motif renders in its own theme's
colours") and 13 ("bind the paths to the theme's ramp steps").

Run with: npm run generate:motifs
"""

import os
import re
import struct
import sys
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "design", "assets", "motifs")
OUT_DIR = os.path.join(ROOT, "src", "components", "header", "motifs")
THEMES_CSS = os.path.join(ROOT, "src", "styles", "themes.css")

# Layer-2 semantic tokens, in the order we prefer to name them. Yoga's five
# ramps carry identical greyscale values (3.3), so one hex maps to a primitive
# in every ramp at once; this order picks the same vocabulary the other nine
# motifs use rather than an arbitrary winner.
SEMANTIC_BY_PRIMITIVE = [
    ("accent-primary", "primary-450"),
    ("accent-secondary", "secondary-350"),
    ("accent-tertiary", "tertiary-300"),
    ("accent-quaternary", "quaternary-250"),
    ("accent-pentenary", "pentenary-300"),
    ("accent-subtle", "primary-150"),
    ("accent-muted", "primary-350"),
    ("accent-strong", "primary-550"),
]


def read_png(path):
    """Decode an 8-bit RGBA PNG to (width, height, bytes). No dependencies."""
    data = open(path, "rb").read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit(f"{path}: not a PNG")
    pos, idat, w, h, ct = 8, b"", 0, 0, None
    while pos < len(data):
        (length,) = struct.unpack(">I", data[pos : pos + 4])
        kind = data[pos + 4 : pos + 8]
        chunk = data[pos + 8 : pos + 8 + length]
        if kind == b"IHDR":
            w, h, depth, ct, _, _, interlace = struct.unpack(">IIBBBBB", chunk)
            if depth != 8 or ct != 6 or interlace:
                raise SystemExit(f"{path}: need non-interlaced 8-bit RGBA")
        elif kind == b"IDAT":
            idat += chunk
        elif kind == b"IEND":
            break
        pos += 12 + length

    raw = zlib.decompress(idat)
    stride, bpp = w * 4, 4
    out, prev, i = bytearray(), bytearray(stride), 0
    for _ in range(h):
        f = raw[i]
        i += 1
        line = bytearray(raw[i : i + stride])
        i += stride
        if f == 1:
            for x in range(bpp, stride):
                line[x] = (line[x] + line[x - bpp]) & 255
        elif f == 2:
            for x in range(stride):
                line[x] = (line[x] + prev[x]) & 255
        elif f == 3:
            for x in range(stride):
                a = line[x - bpp] if x >= bpp else 0
                line[x] = (line[x] + ((a + prev[x]) >> 1)) & 255
        elif f == 4:
            for x in range(stride):
                a = line[x - bpp] if x >= bpp else 0
                c = prev[x - bpp] if x >= bpp else 0
                b = prev[x]
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[x] = (line[x] + pr) & 255
        elif f != 0:
            raise SystemExit(f"{path}: bad filter {f}")
        out += line
        prev = line
    return w, h, out


def ramp_for(css, theme):
    """theme -> {hex: [primitive names]} from the layer-1 block in themes.css."""
    if theme == "peacock":  # peacock doubles as :root
        m = re.search(r':root,\s*\[data-theme="peacock"\]\s*\{([^}]*)\}', css)
    else:
        m = re.search(r'\[data-theme="%s"\]\s*\{([^}]*)\}' % theme, css)
    if not m:
        raise SystemExit(f"no layer-1 block for theme {theme}")
    out = {}
    for family, step, hexv in re.findall(
        r"--nid-(\w+)-(\d+):\s*(#[0-9A-Fa-f]{6})", m.group(1)
    ):
        out.setdefault(hexv.lower(), []).append(f"{family}-{step}")
    return out


def token_for(hexv, primitives, theme, warnings):
    for semantic, primitive in SEMANTIC_BY_PRIMITIVE:
        if primitive in primitives:
            return f"var(--nid-{semantic})"
    # No layer-2 token resolves here. Tiger's stripes are the documented case:
    # quaternary-650 (#0B0A09) is deliberately near-black so the motif reads
    # black-on-ochre (3.3), and it must NOT invert with appearance - which is
    # exactly why a semantic token would be wrong. Name the primitive and say so.
    warnings.append(f"  {theme}: {hexv} -> primitive {primitives[0]} (no layer-2 token)")
    return f"var(--nid-{primitives[0]})"


def rects(w, h, px):
    """Greedy maximal rectangles per colour. Lossless: alpha is 0 or 255."""
    grid = []
    for y in range(h):
        row = []
        for x in range(w):
            o = (y * w + x) * 4
            r, g, b, a = px[o], px[o + 1], px[o + 2], px[o + 3]
            row.append(f"#{r:02x}{g:02x}{b:02x}" if a > 127 else None)
        grid.append(row)

    seen = [[False] * w for _ in range(h)]
    found = []
    for y in range(h):
        for x in range(w):
            if seen[y][x] or grid[y][x] is None:
                continue
            colour = grid[y][x]
            run = x
            while run < w and not seen[y][run] and grid[y][run] == colour:
                run += 1
            width = run - x
            depth = 1
            while y + depth < h and all(
                not seen[y + depth][k] and grid[y + depth][k] == colour
                for k in range(x, run)
            ):
                depth += 1
            for yy in range(y, y + depth):
                for xx in range(x, run):
                    seen[yy][xx] = True
            found.append((colour, x, y, width, depth))
    return found


def main():
    css = open(THEMES_CSS, encoding="utf-8").read()
    sources = sorted(f for f in os.listdir(SRC_DIR) if f.endswith(".png"))
    if not sources:
        raise SystemExit(f"no PNGs in {SRC_DIR}")

    warnings, index = [], []
    for filename in sources:
        theme = os.path.splitext(filename)[0].lower()
        w, h, px = read_png(os.path.join(SRC_DIR, filename))
        ramp = ramp_for(css, theme)

        by_colour = {}
        for colour, x, y, rw, rh in rects(w, h, px):
            by_colour.setdefault(colour, []).append((x, y, rw, rh))

        groups, total = [], 0
        for colour, boxes in sorted(by_colour.items(), key=lambda kv: -len(kv[1])):
            primitives = ramp.get(colour)
            if not primitives:
                raise SystemExit(f"{theme}: {colour} is not a step of its own ramp")
            fill = token_for(colour, primitives, theme, warnings)
            d = "".join(f"M{x} {y}h{rw}v{rh}h-{rw}z" for x, y, rw, rh in boxes)
            groups.append(f'      <path fill="{fill}" d="{d}" />')
            total += len(boxes)

        pascal = theme.capitalize()
        body = "\n".join(groups)
        out = f'''// GENERATED by scripts/generate-motifs.py - do not edit by hand.
// Source: design/assets/motifs/{filename} (Figma `Motif/{pascal}`).
// Regenerate with `npm run generate:motifs`.
import type {{ MotifProps }} from "@/components/header/motifs";

export function {pascal}Motif({{ className }}: MotifProps) {{
  return (
    <svg viewBox="0 0 {w} {h}" className={{className}} focusable="false">
{body}
    </svg>
  );
}}
'''
        open(os.path.join(OUT_DIR, f"{theme}.tsx"), "w", encoding="utf-8").write(out)
        index.append((theme, pascal))
        print(f"  {theme:12} {len(by_colour)} colours, {total:3} rects")

    imports = "\n".join(
        f'import {{ {p}Motif }} from "@/components/header/motifs/{t}";' for t, p in index
    )
    entries = "\n".join(f"  {t}: {p}Motif," for t, p in index)
    # Rebuild index.ts: keep its hand-written prose, regenerate the machine
    # parts. Strip any previously generated motif imports first so repeated runs
    # are idempotent rather than stacking duplicates.
    index_path = os.path.join(OUT_DIR, "index.ts")
    header = open(index_path, encoding="utf-8").read()
    header = header.split("export const MOTIFS")[0]
    header = re.sub(
        r'^import \{ \w+Motif \} from "@/components/header/motifs/\w+";\n',
        "",
        header,
        flags=re.M,
    ).rstrip()
    anchor = 'import type { Theme } from "@/lib/theme-constants";'
    header = header.replace(anchor, anchor + "\n" + imports, 1)
    open(index_path, "w", encoding="utf-8").write(
        header
        + "\nexport const MOTIFS: Record<Theme, ComponentType<MotifProps>> = {\n"
        + entries
        + "\n};\n"
    )

    if warnings:
        print("\nprimitive fallbacks (intentional, see 3.3):")
        print("\n".join(sorted(set(warnings))))
    print(f"\ngenerate-motifs: wrote {len(index)} motifs to src/components/header/motifs/")


if __name__ == "__main__":
    sys.exit(main())
