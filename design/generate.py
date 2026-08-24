#!/usr/bin/env python3
"""Generate NID design-token artefacts from the values extracted out of Figma."""
import json, os, collections
from pathlib import Path

ROOT = str(Path(__file__).resolve().parent)
OUT  = os.path.join(ROOT, "tokens")
os.makedirs(OUT, exist_ok=True)

THEMES = ["Peacock","Lotus","Indigo","Henna","Yoga","Tanjore","Khadi","Terracotta","Ikkat","Tiger"]
THEME_MODE_IDS = ["3131:3","3131:0","3131:1","3131:2","3131:4","3131:5","3158:0","3161:0","3175:0","3175:1"]
RAMPS = ["primary","secondary","tertiary","quaternary","pentenary"]
STEPS = ["050","100","150","200","250","300","350","400","450","500","550","600","650"]

# ---------------------------------------------------------------- primitives
primitives = collections.OrderedDict()   # name -> {theme: hex}
for line in open(os.path.join(ROOT, "_raw_primitives.txt")):
    line = line.strip()
    if not line: continue
    parts = line.split("|")
    name, vals = parts[0], parts[1:]
    assert len(vals) == 10, (name, len(vals))
    primitives[name] = collections.OrderedDict(zip(THEMES, vals))

assert len(primitives) == 65, len(primitives)

# ------------------------------------------------------------------ semantic
sem_order, sem_raw = [], {}
for line in open(os.path.join(ROOT, "_raw_semantic.txt")):
    line = line.strip()
    if not line: continue
    name, light, dark = line.split("|")
    sem_order.append(name)
    sem_raw[name] = {"light": light, "dark": dark}

def resolve(name, appearance, seen=None):
    """Resolve a semantic token to a primitive name, following @aliases."""
    seen = seen or set()
    if name in seen: raise RuntimeError("alias cycle at " + name)
    seen.add(name)
    target = sem_raw[name][appearance]
    if target.startswith("@"):
        return resolve(target[1:], appearance, seen)
    return target

resolved = collections.OrderedDict()      # token -> {light: primitive, dark: primitive}
for t in sem_order:
    resolved[t] = {a: resolve(t, a) for a in ("light", "dark")}

# ----------------------------------------------------------------- typography
# size / line-height per breakpoint mode: [4col, 3col, 2col, 1col]
TYPE = collections.OrderedDict([
 ("Display/Serif Card",   {"font":"secondary","weight":"Subhead Regular","tracking":"-1%",  "case":"none", "size":[28,26,24,22], "lh":[29.5,28,26,24]}),
 ("Display/Serif",        {"font":"secondary","weight":"Display Demi",   "tracking":"-1%",  "case":"none", "size":[28,26,24,22], "lh":[26,26,24,23]}),
 ("Display/Quote",        {"font":"secondary","weight":"Subhead Italic", "tracking":"-2%",  "case":"none", "size":[25,24,22,20], "lh":[32,31,29,27]}),
 ("Heading/1",            {"font":"primary",  "weight":"Heavy",          "tracking":"-3%",  "case":"none", "size":[60,52,40,32], "lh":[60,54,44,36]}),
 ("Heading/2",            {"font":"primary",  "weight":"Heavy",          "tracking":"0",    "case":"none", "size":[32,30,26,24], "lh":[36,34,30,28]}),
 ("Heading/3",            {"font":"primary",  "weight":"Heavy",          "tracking":"0",    "case":"none", "size":[27,26,24,22], "lh":[35,34,32,30]}),
 ("Heading/4",            {"font":"primary",  "weight":"Heavy",          "tracking":"0",    "case":"none", "size":[24,23,21,20], "lh":[30,29,27,26]}),
 ("Heading/5",            {"font":"primary",  "weight":"Heavy",          "tracking":"0",    "case":"none", "size":[20,20,19,18], "lh":[24,24,24,24]}),
 ("Heading/6",            {"font":"primary",  "weight":"Heavy",          "tracking":"1%",   "case":"none", "size":[16,16,16,16], "lh":[20,20,20,20]}),
 ("Label/Overline",       {"font":"primary",  "weight":"Heavy",          "tracking":"16%",  "case":"upper","size":[12,12,12,12], "lh":[12,12,12,12]}),
 ("Label/Meta",           {"font":"primary",  "weight":"Demi",           "tracking":"2%",   "case":"none", "size":[14,14,14,14], "lh":[18,18,18,18]}),
 ("Label/Small",          {"font":"primary",  "weight":"Medium",         "tracking":"4%",   "case":"none", "size":[14,14,14,14], "lh":[20,20,20,20]}),
 ("Label/Button",         {"font":"primary",  "weight":"Bold",           "tracking":"10%",  "case":"upper","size":[14,14,14,14], "lh":[16,16,16,16]}),
 ("Label/Micro",          {"font":"primary",  "weight":"Medium",         "tracking":"4%",   "case":"none", "size":[12,12,12,12], "lh":[15.5,15.5,15.5,15.5]}),
 ("Body/Large/Regular",   {"font":"body",     "weight":"Light",          "tracking":"-1%",  "case":"none", "size":[20,18,18,16], "lh":[30,27,27,24]}),
 ("Body/Large/Bold",      {"font":"body",     "weight":"SemiBold",       "tracking":"2%",   "case":"none", "size":[20,18,18,16], "lh":[30,27,27,24]}),
 ("Body/Base/Regular",    {"font":"body",     "weight":"Regular",        "tracking":"1%",   "case":"none", "size":[16,16,16,16], "lh":[28,28,26,26]}),
 ("Body/Base/Bold",       {"font":"body",     "weight":"Bold",           "tracking":"1%",   "case":"none", "size":[16,16,16,16], "lh":[26,26,26,26]}),
 ("Body/Base/Italic",     {"font":"body",     "weight":"Regular Italic", "tracking":"1%",   "case":"none", "size":[16,16,16,16], "lh":[26,26,26,26]}),
 ("Body/Caption/Regular", {"font":"body",     "weight":"Regular",        "tracking":"2%",   "case":"none", "size":[12,12,12,12], "lh":[18,18,18,18]}),
 ("Body/Caption/Bold",    {"font":"body",     "weight":"Bold",           "tracking":"1%",   "case":"none", "size":[12,12,12,12], "lh":[18,18,18,18]}),
 ("Body/Caption/Italic",  {"font":"body",     "weight":"Regular Italic", "tracking":"1%",   "case":"none", "size":[12,12,12,12], "lh":[18,18,18,18]}),
])

BP = ["desktop","laptop","tablet","mobile"]
GRID = {
 "columns":       [4, 3, 2, 1],
 "pageMargin":    [24, 24, 24, 16],
 "columnGap":     [24, 24, 20, 16],
 "rowGap":        [24, 24, 20, 16],
 "contentWidth":  [1392, 976, 720, 358],
 "columnWidth":   [330, 309, 350, 358],          # as printed in the Figma spec
 # exact: contentWidth minus gaps, divided by columns. Only the 3-col case is fractional.
 "columnWidthExact": [330.0, round((976 - 2*24)/3, 4), 350.0, 358.0],
 "minViewport":   [1280, 1024, 768, 0],
 "referenceWidth":[1440, 1024, 768, 390],
}
SPACING = [0, 2, 4, 8, 12, 16, 24, 32, 48, 56, 64]

# ---- single source of truth for the body face. Everything about it — the
# CSS family, the fallback stack, where its stylesheet loads from, and the
# four weight numbers — flows out of this one dict into themes.css,
# tokens.json, and tokens/font-manifest.json. To swap the body face: change
# this, re-run generate.py, and copy tokens/{themes.css,font-manifest.json}
# into src/{styles,lib}/ — nothing else needs hand-editing.
BODY_FACE = {
    "family": "Merriweather Sans",             # CSS font-family display name
    "fallback": ["system-ui", "sans-serif"],   # after the primary family
    # Google Fonts css2 URL for the variable range this design needs (roman
    # + italic, weight 300-800). None means the face is served by the
    # Typekit kit already linked in HeadShell — no second stylesheet needed.
    "stylesheetUrl": (
        "https://fonts.googleapis.com/css2"
        "?family=Merriweather+Sans:ital,wght@0,300..800;1,300..800&display=swap"
    ),
    "weights": {"light": 300, "regular": 400, "semibold": 600, "bold": 700},
}

def body_font_css():
    return '"%s", %s' % (BODY_FACE["family"], ", ".join(BODY_FACE["fallback"]))

FONTS = {"primary": "Futura PT", "secondary": "Bodoni PT VF", "body": BODY_FACE["family"]}

def slug(name):
    return name.lower().replace("/", "-").replace(" ", "-")

# letter-spacing accepts a length or `normal`, never a percentage — every
# --nid-type-*-tracking value gets converted at CSS-emit time. tokens.json's
# own `tracking` field stays % (it mirrors the Figma source), same as size/lh
# staying unitless there and only gaining `px` here.
def tracking_css(pct):
    if pct == "0":
        return "0"
    assert pct.endswith("%"), pct
    return "%gem" % (float(pct[:-1]) / 100)

# The Figma weight name maps directly to --nid-weight-* per font family.
# Merriweather Sans (font "body") is a 300–800 variable family with true
# italics, so all four weights are real cuts, not a collapse: "Regular
# Italic" shares the same numeric weight as "Regular" (italic is a style
# axis, not a separate weight) — is_italic() below adds font-style
# separately.
_PRIMARY_WEIGHT = {"Heavy": "heavy", "Demi": "demi", "Medium": "medium", "Bold": "bold"}
_SECONDARY_WEIGHT = {
    "Subhead Regular": "serif-subhead",
    "Display Demi": "serif-display",
    "Subhead Italic": "serif-subhead",
}
_BODY_WEIGHT = {
    "Light": "body-light",
    "Regular": "body",
    "SemiBold": "body-semibold",
    "Bold": "body-bold",
    "Regular Italic": "body",
}

def weight_var(font, weight_name):
    if font == "body":
        return _BODY_WEIGHT[weight_name]
    if font == "primary":
        return _PRIMARY_WEIGHT[weight_name]
    if font == "secondary":
        return _SECONDARY_WEIGHT[weight_name]
    raise ValueError(font)

def is_italic(weight_name):
    return "Italic" in weight_name

# ------------------------------------------------------------- tokens.json
doc = {
  "$meta": {
    "source": "Figma file EAoxODvNK8dNGAeovGI5D7 — NID Design System",
    "generated": "extracted verbatim from the Figma variable collections",
    "collections": ["Theme (10 modes)", "Appearance (Light/Dark)", "Breakpoint (4 modes)",
                    "Typography", "Spacing", "Base"],
  },
  "base": {"black": "#000000", "white": "#FFFFFF"},
  "themes": THEMES,
  "themeModeIds": dict(zip(THEMES, THEME_MODE_IDS)),
  "ramps": RAMPS,
  "steps": STEPS,
  "primitives": primitives,
  "semantic": {
     "aliases": sem_raw,
     "resolvedToPrimitive": resolved,
     "byThemeAndAppearance": {
        theme: {
           appearance: {tok: primitives[resolved[tok][appearance]][theme] for tok in sem_order}
           for appearance in ("light", "dark")
        } for theme in THEMES
     },
  },
  "typography": {
     "fonts": FONTS,
     "breakpoints": BP,
     "styles": {k: dict(v, size=dict(zip(BP, v["size"])), lineHeight=dict(zip(BP, v["lh"])))
                for k, v in TYPE.items()},
  },
  "grid": {k: dict(zip(BP, v)) for k, v in GRID.items()},
  "spacing": {str(s): s for s in SPACING},
  "radius": {"none": 0, "pill": 24, "circle": 9999, "heroTopLeft": 64},
}
for s in doc["typography"]["styles"].values():
    s.pop("lh", None)

with open(os.path.join(OUT, "tokens.json"), "w") as f:
    json.dump(doc, f, indent=2)

# --------------------------------------------------------- font-manifest.json
# JSON so both TypeScript (src/app/head-shell.tsx) and Node scripts
# (scripts/verify-fonts.mjs) can read the body face's stylesheet URL and
# weights without either one hardcoding the family name.
font_manifest = {
    "body": {
        "family": BODY_FACE["family"],
        "cssFamily": body_font_css(),
        "stylesheetUrl": BODY_FACE["stylesheetUrl"],
        "weights": BODY_FACE["weights"],
    },
}
with open(os.path.join(OUT, "font-manifest.json"), "w") as f:
    json.dump(font_manifest, f, indent=2)

# ------------------------------------------------------------- themes.css
L = []
w = L.append
w("/* ============================================================================")
w("   NID Design System — design tokens as CSS custom properties")
w("   Generated from Figma file EAoxODvNK8dNGAeovGI5D7.")
w("")
w("   Two independent axes, both set as data-attributes on <html>:")
w("     data-theme=\"peacock|lotus|indigo|henna|yoga|tanjore|khadi|terracotta|ikkat|tiger\"")
w("     data-appearance=\"light|dark\"")
w("")
w("   Layer 1  --nid-<ramp>-<step>   65 primitives, swapped by data-theme")
w("   Layer 2  --nid-<semantic>      27 semantic tokens, swapped by data-appearance")
w("   Components must only ever reference layer 2.")
w("   ========================================================================== */")
w("")
w(":root {")
w("  /* ---- base ---- */")
w("  --nid-black: #000000;")
w("  --nid-white: #FFFFFF;")
w("")
w("  /* ---- spacing ---- */")
for s in SPACING:
    w("  --nid-space-%d: %dpx;" % (s, s))
w("")
w("  /* ---- radius ---- */")
w("  --nid-radius-none: 0;")
w("  --nid-radius-pill: 24px;      /* Button-type CTA, Icon Button */")
w("  --nid-radius-circle: 9999px;")
w("  --nid-radius-hero: 64px;      /* top-left corner of a secondary-page hero only */")
w("")
w("  /* ---- font families ----")
w("     primary + secondary: Adobe Typekit kit svx1oks.")
w("     body: %s, loaded separately — see BODY_FACE in generate.py /" % BODY_FACE["family"])
w("     tokens/font-manifest.json. Provisional; will change again. */")
w('  --nid-font-primary: "futura-pt", "Futura", "Century Gothic", sans-serif;')
w('  --nid-font-primary-display: "futura-pt-bold", "futura-pt", sans-serif;')
w('  --nid-font-secondary: "bodoni-pt-variable", "Bodoni Moda", Didot, serif;')
w("  --nid-font-body: %s;" % body_font_css())
w("")
w("  /* ---- font weights ----")
w("     futura-pt          300 400 500 600 700 800  — Adobe Typekit kit svx1oks")
w("     futura-pt-bold     700                        — Adobe Typekit kit svx1oks")
w("     bodoni-pt-variable 400–800 variable, roman + italic — Adobe Typekit kit svx1oks")
w(
    "     %s %s, roman + italic — Google Fonts */"
    % (BODY_FACE["family"], " ".join(str(v) for v in BODY_FACE["weights"].values()))
)
w("  --nid-weight-light: 300;         /* Futura PT Light  */")
w("  --nid-weight-book: 400;          /* Futura PT Book   */")
w("  --nid-weight-medium: 500;        /* Futura PT Medium */")
w("  --nid-weight-demi: 600;          /* Futura PT Demi   */")
w("  --nid-weight-heavy: 700;         /* Futura PT Heavy  */")
w("  --nid-weight-bold: 800;          /* Futura PT Bold   */")
w("  --nid-weight-serif-display: 600; /* Bodoni Display Demi   */")
w("  --nid-weight-serif-subhead: 400; /* Bodoni Subhead        */")
w("  --nid-weight-body-light: %d;     /* %s Light    */" % (BODY_FACE["weights"]["light"], BODY_FACE["family"]))
w("  --nid-weight-body: %d;           /* %s Regular  */" % (BODY_FACE["weights"]["regular"], BODY_FACE["family"]))
w("  --nid-weight-body-semibold: %d;  /* %s SemiBold */" % (BODY_FACE["weights"]["semibold"], BODY_FACE["family"]))
w("  --nid-weight-body-bold: %d;      /* %s Bold     */" % (BODY_FACE["weights"]["bold"], BODY_FACE["family"]))
w("")
w("  /* ---- grid (desktop / 4 col default; overridden in media queries below) ---- */")
w("  --nid-grid-columns: 4;")
w("  --nid-grid-page-margin: 24px;")
w("  --nid-grid-column-gap: 24px;")
w("  --nid-grid-row-gap: 24px;")
w("  --nid-grid-content-width: 1392px;")
w("")
w("  /* content width plus both page margins = the reference artboard width */")
w("  --nid-grid-shell-width: calc(var(--nid-grid-content-width) + 2 * var(--nid-grid-page-margin));")
w("}")
w("")

# --- theme blocks
w("/* ==========================================================================")
w("   Layer 1 — theme primitives. One block per theme.")
w("   ========================================================================== */")
for i, theme in enumerate(THEMES):
    sel = ':root, [data-theme="%s"]' % slug(theme) if i == 0 else '[data-theme="%s"]' % slug(theme)
    w("")
    w("/* %s%s */" % (theme, "  (default)" if i == 0 else ""))
    w("%s {" % sel)
    for ramp in RAMPS:
        for step in STEPS:
            key = "%s/%s" % (ramp, step)
            w("  --nid-%s-%s: %s;" % (ramp, step, primitives[key][theme]))
        w("")
    L[-1] = "}"
w("")

# --- appearance blocks
w("/* ==========================================================================")
w("   Layer 2 — semantic tokens. Identical in every theme; only the")
w("   appearance axis changes which primitive step each one points at.")
w("   ========================================================================== */")
for appearance, sel in (("light", ':root, [data-appearance="light"]'), ("dark", '[data-appearance="dark"]')):
    w("")
    w("%s {" % sel)
    group = None
    for tok in sem_order:
        g = tok.split("/")[0]
        if g != group:
            if group is not None: w("")
            w("  /* %s */" % g)
            group = g
        w("  --nid-%s: var(--nid-%s);" % (slug(tok), slug(resolved[tok][appearance])))
    w("}")
w("")
w('@media (prefers-color-scheme: dark) {')
w('  :root:not([data-appearance]) {')
for tok in sem_order:
    w("    --nid-%s: var(--nid-%s);" % (slug(tok), slug(resolved[tok]["dark"])))
w("  }")
w("}")
w("")

# --- typography
w("/* ==========================================================================")
w("   Type scale. Sizes are the Desktop / 4-col values; the media queries")
w("   further down re-declare only what actually changes per breakpoint.")
w("   ========================================================================== */")
w(":root {")
for name, s in TYPE.items():
    w("  --nid-type-%s-size: %gpx;" % (slug(name), s["size"][0]))
    w("  --nid-type-%s-lh: %gpx;" % (slug(name), s["lh"][0]))
    w("  --nid-type-%s-tracking: %s;" % (slug(name), tracking_css(s["tracking"])))
w("}")
w("")

MQ = [("laptop", 1, "@media (max-width: 1279px)"),
      ("tablet", 2, "@media (max-width: 1023px)"),
      ("mobile", 3, "@media (max-width: 767px)")]
for label, idx, mq in MQ:
    w("/* --- %s --- */" % label)
    w("%s {" % mq)
    w("  :root {")
    w("    --nid-grid-columns: %d;" % GRID["columns"][idx])
    w("    --nid-grid-page-margin: %dpx;" % GRID["pageMargin"][idx])
    w("    --nid-grid-column-gap: %dpx;" % GRID["columnGap"][idx])
    w("    --nid-grid-row-gap: %dpx;" % GRID["rowGap"][idx])
    w("    --nid-grid-content-width: %dpx;" % GRID["contentWidth"][idx])
    for name, s in TYPE.items():
        if s["size"][idx] != s["size"][idx-1]:
            w("    --nid-type-%s-size: %gpx;" % (slug(name), s["size"][idx]))
        if s["lh"][idx] != s["lh"][idx-1]:
            w("    --nid-type-%s-lh: %gpx;" % (slug(name), s["lh"][idx]))
    w("  }")
    w("}")
    w("")

# --- utility classes for each text style
w("/* ==========================================================================")
w("   One class per Figma text style. These are the only places font-family,")
w("   size, line-height and tracking should be declared.")
w("   ========================================================================== */")
for name, s in TYPE.items():
    w(".nid-%s {" % slug(name))
    w("  font-family: var(--nid-font-%s);" % s["font"])
    w("  font-size: var(--nid-type-%s-size);" % slug(name))
    w("  line-height: var(--nid-type-%s-lh);" % slug(name))
    w("  letter-spacing: var(--nid-type-%s-tracking);" % slug(name))
    if s["case"] == "upper":
        w("  text-transform: uppercase;")
    w("  font-weight: var(--nid-weight-%s);" % weight_var(s["font"], s["weight"]))
    if is_italic(s["weight"]):
        w("  font-style: italic;")
    w("}")
w("")

with open(os.path.join(OUT, "themes.css"), "w") as f:
    f.write("\n".join(L) + "\n")

print("primitives:", len(primitives))
print("semantic:", len(sem_order))
print("styles:", len(TYPE))
print("themes.css lines:", len(L))
