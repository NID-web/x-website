#!/usr/bin/env python3
"""Emit the home-page craft pattern fields as SVG <pattern> components.

Source : design/assets/patterns/home-patterns.json
Output : src/components/home/patterns.tsx

The JSON holds each tiled field as one 24x24-cell unit already merged into
maximal rectangles per colour, and each scatter field as loose cells at design
size. It was extracted once from the Figma Make export of the Home frame
(Figma node 3031:50673), which has since been removed from the repo - now that
the Figma MCP is available, re-derive from Figma if a pattern changes and
update the JSON rather than editing patterns.tsx.

Colours in the JSON are the design hexes. They are mapped to semantic accent
tokens here, through the peacock ramp in themes.css, so the fields re-theme
and invert with appearance.

Run with: npm run generate:patterns
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# How many units of the repeat a field is, per side. A unit is 81px at the 330px
# reference tile, so a full-tile field is 4x4 - which is what the boards draw.
# The alumni bed is not a full tile: it is the LEFT HALF of one, and shows 2x2
# there. Getting this wrong does not crop or repeat any more, it just renders
# the motif at the wrong size.
FIELD_UNITS_DEFAULT = 4
FIELD_UNITS = {"PatternFieldAlumni": 2}
SOURCE = os.path.join(ROOT, "design", "assets", "patterns", "home-patterns.json")
OUT = os.path.join(ROOT, "src", "components", "home", "patterns.tsx")
THEMES_CSS = os.path.join(ROOT, "src", "styles", "themes.css")

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


def main():
    data = json.load(open(SOURCE, encoding="utf-8"))
    ramp = peacock_ramp()
    warnings = []
    components = []

    unit_cells = data["unitCells"]
    # The unit is 81 CSS px across (two 12-cell quadrants of 3.375px cells),
    # drawn on a unit_cells grid, so the paths are scaled by 81/unit_cells.
    # Getting this wrong renders the field at grid scale - visibly too dense.
    unit_px = data["cell"] * 12 * 2
    scale = unit_px / unit_cells
    # A field is a FIXED count of units (FIELD_UNITS), as the boards draw it,
    # expressed as a viewBox so the whole composition scales with the tile. It
    # used to be a <pattern> on a bare <svg>: no viewBox meant one user unit =
    # one CSS px, so a wider tile revealed MORE units and a narrower one cropped
    # them, which is not what the design does (docs/STAGE-0-NOTES.md §41).

    def paths_for(by_colour, indent):
        out = []
        for colour, boxes in sorted(by_colour.items(), key=lambda kv: -len(kv[1])):
            fill = token_for(colour, ramp, warnings)
            d = "".join(f"M{x} {y}h{w}v{h}h-{w}z" for x, y, w, h in boxes)
            out.append(f'{indent}<path fill="{fill}" d="{d}" />')
        return chr(10).join(out)

    for field in data["fields"]:
        label = field["label"]
        by_colour = field["rects"]
        units = FIELD_UNITS.get(label, FIELD_UNITS_DEFAULT)
        field_px = unit_px * units
        pid = f"nid-{label.lower()}"

        # Frames 1..3 shimmer a handful of cells around a lattice that does not
        # move (design/tokens: the Patternimate component sets). A field with no
        # frames is drawn the old way, as one <pattern> fill.
        frames = field.get("frames")

        if not frames:
            components.append(f'''
export function {label}({{ className }}: PatternFieldProps) {{
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 {field_px:g} {field_px:g}"
      preserveAspectRatio="xMidYMid slice"
      className={{className}}
    >
      <defs>
        <pattern id="{pid}" width="{unit_px:g}" height="{unit_px:g}" patternUnits="userSpaceOnUse">
          <g transform="scale({scale:g})">
{paths_for(by_colour, "        ")}
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#{pid})" />
    </svg>
  );
}}''')
            print(f"  {label:14} {sum(len(v) for v in by_colour.values()):3} rects, "
                  f"{len(by_colour)} colours (static)")
            continue

        # Animated. A <pattern> paint server cannot be hovered — it paints one
        # rect, so there is no per-unit element to put :hover on. So the units
        # are emitted as real <use>s of four defs, one per frame, and each unit
        # carries its own transparent hit rect (fill="none" would not receive
        # the pointer). ids are suffixed per field: two fields on one page would
        # otherwise collide in the document-wide id space.
        defs = chr(10).join(
            f'''        <g id="{pid}-f{i}">
{paths_for(frame, "          ")}
        </g>'''
            for i, frame in enumerate(frames)
        )
        uses = chr(10).join(
            f'            <use href="#{pid}-f{i}" className="nid-pattern-frame" />'
            for i in range(len(frames))
        )
        cells = chr(10).join(
            f'''        <g className="nid-pattern-unit" transform="translate({c * unit_px:g} {r * unit_px:g})">
          <rect width="{unit_px:g}" height="{unit_px:g}" fill="transparent" />
          <g transform="scale({scale:g})">
{uses}
          </g>
        </g>'''
            for r in range(units)
            for c in range(units)
        )
        components.append(f'''
export function {label}({{ className }}: PatternFieldProps) {{
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 {field_px:g} {field_px:g}"
      preserveAspectRatio="xMidYMid slice"
      className={{className}}
    >
      <defs>
{defs}
      </defs>
{cells}
    </svg>
  );
}}''')
        print(f"  {label:14} {sum(len(v) for v in by_colour.values()):3} rects, "
              f"{len(by_colour)} colours, {len(frames)} frames x {units}x{units} units")

    for scatter in data["scatters"]:
        label, edge, by_colour = scatter["label"], scatter["edge"], scatter["cells"]
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
