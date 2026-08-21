#!/usr/bin/env python3
"""Verify the emitted token files actually resolve, in all 20 theme x appearance states."""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent

OK, FAIL = [], []
def check(label, cond, detail=""):
    (OK if cond else FAIL).append(label + (" — " + detail if detail else ""))

tok = json.load(open(ROOT / "tokens" / "tokens.json"))
css = open(ROOT / "tokens" / "themes.css").read()
site = json.load(open(ROOT / "tokens" / "sitemap.json"))

THEMES = tok["themes"]
check("tokens.json parses", True)
check("sitemap.json parses", True)
check("10 themes", len(THEMES) == 10, str(len(THEMES)))
check("65 primitives", len(tok["primitives"]) == 65, str(len(tok["primitives"])))
check("27 semantic tokens", len(tok["semantic"]["aliases"]) == 27, str(len(tok["semantic"]["aliases"])))
check("22 text styles", len(tok["typography"]["styles"]) == 22, str(len(tok["typography"]["styles"])))

# every primitive has a value for every theme, and it is a valid 6-digit hex
hexre = re.compile(r"^#[0-9A-F]{6}$")
bad = [(n, t) for n, m in tok["primitives"].items() for t in THEMES
       if not hexre.match(m.get(t, ""))]
check("650 primitive values all valid hex", not bad, str(bad[:3]))

# every semantic token resolves to a real primitive in both appearances
missing = [(t, a) for t, m in tok["semantic"]["resolvedToPrimitive"].items()
           for a in ("light", "dark") if m[a] not in tok["primitives"]]
check("every semantic token resolves to a primitive", not missing, str(missing[:3]))

# 20 fully-populated states
states = 0
for theme in THEMES:
    for app in ("light", "dark"):
        vals = tok["semantic"]["byThemeAndAppearance"][theme][app]
        assert len(vals) == 27, (theme, app, len(vals))
        assert all(hexre.match(v) for v in vals.values()), (theme, app)
        states += 1
check("20 theme x appearance states fully populated", states == 20, str(states))

# ---- CSS: simulate the cascade for each state and confirm nothing is undefined
prim_decl = {}   # theme -> {var: hex}
cur = None
for line in css.splitlines():
    m = re.match(r'^(?::root, )?\[data-theme="([a-z]+)"\] \{', line.strip())
    if m: cur = m.group(1); prim_decl[cur] = {}; continue
    if line.strip() == "}": cur = None; continue
    if cur:
        m2 = re.match(r"^\s*(--nid-[a-z]+-\d{3}):\s*(#[0-9A-F]{6});$", line)
        if m2: prim_decl[cur][m2.group(1)] = m2.group(2)

check("css declares 10 theme blocks", len(prim_decl) == 10, str(sorted(prim_decl)))
check("each theme block declares 65 primitives",
      all(len(v) == 65 for v in prim_decl.values()),
      str({k: len(v) for k, v in prim_decl.items() if len(v) != 65}))

sem_decl = {}    # appearance -> {var: referenced var}
cur = None
for line in css.splitlines():
    s = line.strip()
    m = re.match(r'^(?::root, )?\[data-appearance="(light|dark)"\] \{', s)
    if m: cur = m.group(1); sem_decl[cur] = {}; continue
    if s == "}": cur = None; continue
    if cur:
        m2 = re.match(r"^\s*(--nid-[a-z-]+):\s*var\((--nid-[a-z]+-\d{3})\);$", line)
        if m2: sem_decl[cur][m2.group(1)] = m2.group(2)

check("css declares both appearance blocks", set(sem_decl) == {"light", "dark"}, str(sorted(sem_decl)))
check("each appearance block declares 27 tokens",
      all(len(v) == 27 for v in sem_decl.values()),
      str({k: len(v) for k, v in sem_decl.items()}))

# resolve every semantic var through the cascade and compare with tokens.json
def slug(n): return n.lower().replace("/", "-")
mismatch, unresolved = [], []
for theme in THEMES:
    tkey = slug(theme)
    for app in ("light", "dark"):
        for token, expected in tok["semantic"]["byThemeAndAppearance"][theme][app].items():
            var = "--nid-" + slug(token)
            ref = sem_decl[app].get(var)
            if ref is None: unresolved.append((theme, app, token)); continue
            got = prim_decl[tkey].get(ref)
            if got is None: unresolved.append((theme, app, token, ref)); continue
            if got != expected: mismatch.append((theme, app, token, got, expected))
check("every CSS semantic var resolves to a declared primitive", not unresolved, str(unresolved[:3]))
check("CSS cascade matches tokens.json for all 540 pairs", not mismatch, str(mismatch[:3]))

# no raw hex outside the theme blocks (other than base black/white)
stray = []
for line in css.splitlines():
    m = re.match(r"^\s*(--nid-(?!black|white|primary-|secondary-|tertiary-|quaternary-|pentenary-)[a-z0-9-]+):\s*(#[0-9A-Fa-f]{3,8});", line)
    if m: stray.append(m.group(0).strip())
check("no stray hex values on non-primitive tokens", not stray, str(stray[:3]))

# type scale sanity
ty = tok["typography"]["styles"]
check("Heading/1 ramps 60/52/40/32",
      [ty["Heading/1"]["size"][b] for b in ("desktop","laptop","tablet","mobile")] == [60,52,40,32])
check("Body/Base/Regular holds 16px at every breakpoint",
      len(set(ty["Body/Base/Regular"]["size"].values())) == 1)
check("labels never scale",
      all(len(set(ty[s]["size"].values())) == 1
          for s in ("Label/Overline","Label/Meta","Label/Small","Label/Button","Label/Micro")))

# grid arithmetic: margin*2 + gaps*(n-1) + columns*colwidth == reference width
g = tok["grid"]
for bp, ref in (("desktop",1440), ("laptop",1024), ("tablet",768), ("mobile",390)):
    n  = g["columns"][bp]; m = g["pageMargin"][bp]; gap = g["columnGap"][bp]
    cw = g["columnWidth"][bp]; content = g["contentWidth"][bp]
    exact = tok["grid"]["columnWidthExact"][bp]
    check(f"grid arithmetic {bp}", m*2 + content == ref and abs((n-1)*gap + n*exact - content) < 0.001 and abs(exact - cw) <= 0.5,
          f"ref={ref} margin={m} content={content} cols={n}x{cw} gap={gap}")

check("sitemap has 13 sections", len(site["sections"]) == 13, str(len(site["sections"])))
check("sitemap records 8 open decisions", len(site["openDecisions"]) == 8, str(len(site["openDecisions"])))

print("PASS %d" % len(OK))
for f in FAIL: print("  FAIL:", f)
sys.exit(1 if FAIL else 0)
