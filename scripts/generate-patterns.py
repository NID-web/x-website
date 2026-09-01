#!/usr/bin/env python3
"""Rebuild the three home-page craft pattern fields from the Figma Make export.

Source : design/reference/home-figma-make/src/imports/01NidHomeLanding/index.tsx
Output : src/components/home/patterns.tsx

In the export each pattern tile is a 4x4 flex-wrap of an 81px unit, and each
unit is four 40.5px quadrants arranged as a pinwheel (0, 90, 180, -90) over a
12x12 grid of 3.375px cells. Every unit inside a tile is identical, so the three
tiles together account for 25,454 lines - 76% of the whole export - of purely
repeated absolutely-positioned <div>s.

This reads one quadrant per pattern, applies the four rotations to get the 24x24
unit, and emits it as an SVG <pattern>. That collapses those 25k lines to three
small components, makes the field fluid instead of a fixed 4x4 of 81px units,
and - because every colour resolves to a semantic accent token - lets the
patterns re-theme and invert with appearance, which the export cannot.

Run with: npm run generate:patterns
"""

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.join(
    ROOT, "design", "reference", "home-figma-make",
    "src", "imports", "01NidHomeLanding", "index.tsx",
)
OUT = os.path.join(ROOT, "src", "components", "home", "patterns.tsx")
THEMES_CSS = os.path.join(ROOT, "src", "styles", "themes.css")

CELL = 3.375          # px of one design cell
QUAD_PX = CELL * 12   # 40.5px quadrant edge
# Work at HALF-cell resolution. A few cells sit at the quadrant edge with half
# width or height (w-[1.688px]); on a 12-cell grid those are unrepresentable and
# get dropped. SUB=2 keeps every position and size integral.
SUB = 2
QUAD = 12 * SUB       # grid cells per quadrant edge
UNIT = QUAD * 2       # grid cells per 81px unit edge

# Same preference order as scripts/generate-motifs.py.
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

PATTERNS = [
    # label, 81px unit name, quadrant name, enclosing function, next function
    ("PatternField1", "Patternimate-2", "whirlpoolnimate-part",
     "function JustATile()", "function Frame12()"),
    ("PatternField2", "Patternimate-3", "Patternunit-3",
     "function JustATile1()", "function Frame27()"),
    ("PatternField3", "Patternimate-1", "animation-unit",
     "function JustATile2()", "function Frame14()"),
    # The backdrop behind the Notable Alumni portrait: the same cross-garden
    # motif the brand strip uses, but drawn at 3.375px cells instead of 2px.
    ("PatternFieldAlumni", "Pattern", "cross-garden-tile",
     "function NotableAlumniPatternPart(", "function PrideOfNid("),
]

FRACTIONS = {"0": 0.0, "1/2": 0.5, "1/4": 0.25, "3/4": 0.75,
             "1/3": 1 / 3, "2/3": 2 / 3, "full": 1.0}

# Scatter fields are not tiled. The bandhani scatter behind the Notable Alumni
# portrait is a one-off 162px composition of loose cells that thin out towards
# the middle, where the portrait sits - there is no repeating unit to find, so
# these are read cell-for-cell instead of quadrant-and-pinwheel.
#   label, enclosing function, next function, box edge in px
SCATTERS = [
    ("PatternScatterAlumni", "function BandhaniScatter4Fold()",
     "function Frame20()", 162),
]


def peacock_ramp():
    css = open(THEMES_CSS, encoding="utf-8").read()
    m = re.search(r':root,\s*\[data-theme="peacock"\]\s*\{([^}]*)\}', css)
    ramp = {}
    for fam, step, hexv in re.findall(
        r"--nid-(\w+)-(\d+):\s*(#[0-9A-Fa-f]{6})", m.group(1)
    ):
        ramp.setdefault(hexv.lower(), []).append(f"{fam}-{step}")
    return ramp


def token_for(hexv, ramp, warnings):
    primitives = ramp.get(hexv, [])
    for semantic, primitive in SEMANTIC_BY_PRIMITIVE:
        if primitive in primitives:
            return f"var(--nid-{semantic})"
    warnings.append(f"  {hexv} -> {primitives or 'UNKNOWN'} (no layer-2 token)")
    return f"var(--nid-{primitives[0]})" if primitives else None


def frac(token):
    token = token.strip()
    if token.startswith("[") and token.endswith("]"):
        token = token[1:-1]
    if token.endswith("%"):
        return float(token[:-1]) / 100
    if token.endswith("px"):
        return float(token[:-2]) / QUAD_PX
    return FRACTIONS.get(token)


def frac_px(cls, side):
    """Absolute px offset for one side: `left-[27px]`, or a bare `top-0`."""
    m = re.search(r"(?<![\w-])%s-\[([\d.]+)px\]" % side, cls)
    if m:
        return float(m.group(1))
    if re.search(r"(?<![\w-])%s-0(?![\w-])" % side, cls):
        return 0.0
    return None


def cell_rect(cls):
    """Return (col, row, w, h) in grid cells for one positioned leaf."""
    top = right = bottom = left = None
    m = re.search(r"inset-\[([^\]]+)\]", cls)
    if m:
        parts = [frac(p) for p in m.group(1).split("_")]
        if len(parts) == 4:
            top, right, bottom, left = parts
        elif len(parts) == 2:
            top, right = parts
            bottom, left = top, right
        elif len(parts) == 1:
            top = right = bottom = left = parts[0]
    elif re.search(r"(?<![\w-])inset-0(?![\w-])", cls):
        top = right = bottom = left = 0.0

    for side in ("top", "right", "bottom", "left"):
        mm = re.search(r"(?<![\w-])%s-(\[[^\]]+\]|[\w/]+)" % side, cls)
        if mm:
            v = frac(mm.group(1))
            if v is None:
                continue
            if side == "top":
                top = v
            elif side == "right":
                right = v
            elif side == "bottom":
                bottom = v
            else:
                left = v

    # Explicit box: `size-[Npx]`, or separate `w-[Npx]` / `h-[Npx]` (the
    # half-width cells at the quadrant edge use the latter).
    size = re.search(r"size-\[([\d.]+)px\]", cls)
    wpx = re.search(r"(?<![\w-])w-\[([\d.]+)px\]", cls)
    hpx = re.search(r"(?<![\w-])h-\[([\d.]+)px\]", cls)
    sw = float(wpx.group(1)) if wpx else (float(size.group(1)) if size else None)
    sh = float(hpx.group(1)) if hpx else (float(size.group(1)) if size else None)
    if sw is not None and left is not None and right is None:
        right = 1 - (left + sw / QUAD_PX)
    if sh is not None and top is not None and bottom is None:
        bottom = 1 - (top + sh / QUAD_PX)

    if None in (top, right, bottom, left):
        return None
    col, row = round(left * QUAD), round(top * QUAD)
    w, h = round((1 - left - right) * QUAD), round((1 - top - bottom) * QUAD)
    if w <= 0 or h <= 0:
        return None
    return col, row, w, h


def quadrant_cells(block):
    """All coloured leaves in one quadrant, as (col,row,w,h,hex)."""
    cells = []
    for m in re.finditer(r'className="(absolute[^"]*)"', block):
        cls = m.group(1)
        tail = block[m.end(): m.end() + 700]
        colour = re.search(r"bg-\[(#[0-9a-fA-F]{6})\]", cls) or re.search(
            r"bg-\[(#[0-9a-fA-F]{6})\]", tail
        )
        if not colour:
            continue
        rect = cell_rect(cls)
        if rect is None:
            continue
        # Skip a wrapper that covers the whole quadrant. In pattern-3 each cell
        # nests an extra `absolute ... inset-0` box inside its positioned one;
        # counting that as a rect floods the grid with a single colour.
        if rect[2] >= QUAD and rect[3] >= QUAD:
            continue
        cells.append((*rect, colour.group(1).lower()))
    return cells


def rotate(col, row, w, h, angle):
    """Rotate a cell rect about the quadrant centre. Angles are multiples of 90."""
    pts = [(col, row), (col + w, row + h)]
    out = []
    for (x, y) in pts:
        dx, dy = x - QUAD / 2, y - QUAD / 2
        if angle == 0:
            rx, ry = dx, dy
        elif angle == 90:
            rx, ry = -dy, dx
        elif angle == 180:
            rx, ry = -dx, -dy
        else:                       # -90
            rx, ry = dy, -dx
        out.append((rx + QUAD / 2, ry + QUAD / 2))
    xs = [p[0] for p in out]
    ys = [p[1] for p in out]
    return round(min(xs)), round(min(ys)), round(max(xs) - min(xs)), round(max(ys) - min(ys))


def merge(grid):
    """Greedy maximal rectangles over the 24x24 unit grid."""
    seen = [[False] * UNIT for _ in range(UNIT)]
    out = []
    for y in range(UNIT):
        for x in range(UNIT):
            if seen[y][x] or grid[y][x] is None:
                continue
            colour = grid[y][x]
            run = x
            while run < UNIT and not seen[y][run] and grid[y][run] == colour:
                run += 1
            w = run - x
            d = 1
            while y + d < UNIT and all(
                not seen[y + d][k] and grid[y + d][k] == colour for k in range(x, run)
            ):
                d += 1
            for yy in range(y, y + d):
                for xx in range(x, run):
                    seen[yy][xx] = True
            out.append((colour, x, y, w, d))
    return out


def main():
    src = open(EXPORT, encoding="utf-8").read()
    ramp = peacock_ramp()
    warnings = []
    components = []

    for label, unit, quad, start, end in PATTERNS:
        seg = src[src.index(start): src.index(end)]
        i = seg.index('data-name="%s"' % unit)
        j = seg.index('data-name="%s"' % unit, i + 10)
        block = seg[i:j]

        qi = [m.start() for m in re.finditer(r'data-name="%s"' % quad, block)]
        qi.append(len(block))
        cells = quadrant_cells(block[qi[0]: qi[1]])
        if not cells:
            raise SystemExit(f"{label}: no cells parsed for {quad}")

        # Placement of the four quadrants, read off the export's wrappers.
        # pattern-3 starts unrotated top-left; 1 and 2 are the same pinwheel
        # shifted one step. Both are (dx, dy, angle) in cell units.
        if label in ("PatternField3", "PatternFieldAlumni"):
            placements = [(0, 0, 0), (QUAD, 0, 90), (QUAD, QUAD, 180), (0, QUAD, -90)]
        else:
            placements = [(QUAD, 0, 0), (QUAD, QUAD, 90), (0, QUAD, 180), (0, 0, -90)]

        grid = [[None] * UNIT for _ in range(UNIT)]
        for dx, dy, angle in placements:
            for col, row, w, h, hexv in cells:
                rc, rr, rw, rh = rotate(col, row, w, h, angle)
                for yy in range(rr, rr + rh):
                    for xx in range(rc, rc + rw):
                        gx, gy = xx + dx, yy + dy
                        if 0 <= gx < UNIT and 0 <= gy < UNIT:
                            grid[gy][gx] = hexv

        by_colour = {}
        for colour, x, y, w, h in merge(grid):
            by_colour.setdefault(colour, []).append((x, y, w, h))

        paths = []
        for colour, boxes in sorted(by_colour.items(), key=lambda kv: -len(kv[1])):
            fill = token_for(colour, ramp, warnings)
            d = "".join(f"M{x} {y}h{w}v{h}h-{w}z" for x, y, w, h in boxes)
            paths.append(f'        <path fill="{fill}" d="{d}" />')

        pid = f"nid-{label.lower()}"
        # The unit is 81 CSS px across, drawn on a UNIT-cell grid, so the paths
        # are scaled by 81/UNIT. Getting this wrong renders the field at grid
        # scale — visibly too dense.
        unit_px = CELL * 12 * 2
        scale = unit_px / UNIT
        components.append(f'''
export function {label}({{ className }}: PatternFieldProps) {{
  return (
    <svg aria-hidden="true" className={{className}}>
      <defs>
        <pattern id="{pid}" width="{unit_px:g}" height="{unit_px:g}" patternUnits="userSpaceOnUse">
          <g transform="scale({scale:g})">
{chr(10).join(paths)}
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#{pid})" />
    </svg>
  );
}}''')
        print(f"  {label:14} {len(cells):3} cells/quadrant -> "
              f"{sum(len(v) for v in by_colour.values()):3} rects, {len(by_colour)} colours")

    for label, start, end, edge in SCATTERS:
        seg = src[src.index(start): src.index(end)]
        by_colour = {}
        for cls in re.findall(r'className="([^"]*)"', seg):
            if "absolute" not in cls or "bg-[#" not in cls:
                continue
            size = re.search(r"size-\[([\d.]+)px\]", cls)
            if not size:
                continue
            x = frac_px(cls, "left")
            y = frac_px(cls, "top")
            if x is None or y is None:
                continue
            hexv = re.search(r"bg-\[(#[0-9a-fA-F]{6})\]", cls).group(1).lower()
            by_colour.setdefault(hexv, []).append((x, y, float(size.group(1))))

        if not by_colour:
            raise SystemExit(f"{label}: no scatter cells parsed")

        paths = []
        for colour, boxes in sorted(by_colour.items(), key=lambda kv: -len(kv[1])):
            fill = token_for(colour, ramp, warnings)
            d = "".join(f"M{x:g} {y:g}h{w:g}v{w:g}h-{w:g}z" for x, y, w in boxes)
            paths.append(f'      <path fill="{fill}" d="{d}" />')

        components.append(f'''
export function {label}({{ className }}: PatternFieldProps) {{
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 {edge} {edge}"
      preserveAspectRatio="xMidYMid meet"
      className={{className}}
    >
{chr(10).join(paths)}
    </svg>
  );
}}''')
        print(f"  {label:14} {sum(len(v) for v in by_colour.values()):3} scattered cells, "
              f"{len(by_colour)} colours")

    header = '''// GENERATED by scripts/generate-patterns.py - do not edit by hand.
// Regenerate with `npm run generate:patterns`.
//
// The three craft pattern fields of the home bento, rebuilt from the Figma Make
// export (design/reference/home-figma-make/). Each is one 24x24-cell unit -
// four 12x12 quadrants pinwheeled 0/90/180/-90 - repeated by an SVG <pattern>.
//
// In the export these three tiles are 25,454 lines of absolutely positioned
// <div>s, 76% of the whole file, because every unit is spelled out. They are
// identical, so one unit is enough. Emitting them as <pattern> also makes the
// field fluid rather than a fixed 4x4 of 81px units.
//
// Scatter fields (PatternScatter*) are the exception: loose cells with no
// repeating unit, read one-for-one and emitted at their design size.
//
// Fills are semantic accent tokens, so the fields re-theme with the page and
// invert with appearance - a thing the export's baked hexes cannot do. They are
// decorative and aria-hidden, so the decorative ramp is allowed (CLAUDE.md
// § Colour).

export interface PatternFieldProps {
  className?: string;
}
'''
    open(OUT, "w", encoding="utf-8").write(header + "\n".join(components) + "\n")

    if warnings:
        print("\nprimitive fallbacks:")
        print("\n".join(sorted(set(warnings))))
    print(f"\ngenerate-patterns: wrote {len(components)} fields to {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    sys.exit(main())
