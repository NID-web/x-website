// The single source for everything that must run before first paint,
// shared by every <html> tree in the app (locale layout and the global
// not-found page) so they can never paint a different first frame.

import fontManifestRaw from "@/lib/font-manifest.json";

// TypeScript infers `never[]` for the current (empty) preconnect array in
// the JSON literal — the body face is Tonos right now, served by the
// Typekit kit link below, so there's nothing to preconnect to. Assert the
// real shape so a future face with a non-empty preconnect list doesn't need
// this file touched at all.
type FontManifest = {
  body: {
    family: string;
    cssFamily: string;
    stylesheetUrl: string | null;
    preconnect: { origin: string; crossOrigin: boolean }[];
    weights: Record<string, number>;
  };
};
const fontManifest = fontManifestRaw as FontManifest;

// The body face's stylesheet URL and preconnect list live only in
// font-manifest.json (generated from design/generate.py's BODY_FACE) —
// never hardcoded here, so swapping the face is a generate.py + copy step,
// not a HeadShell edit. The manifest carries preconnect as a fully-resolved
// {origin, crossOrigin}[] — e.g. a Google-Fonts-hosted face needs two
// (fonts.googleapis.com for the CSS, fonts.gstatic.com for the CORS-fetched
// font binaries) — so this file has no URL-parsing or provider knowledge of
// its own; it only maps. `stylesheetUrl: null` (Tonos today) means the face
// ships in the same Typekit kit already linked below — nothing to add here.
const BODY_FONT_STYLESHEET_URL = fontManifest.body.stylesheetUrl;
const BODY_FONT_PRECONNECT = fontManifest.body.preconnect;

export const THEME_SCRIPT = `
(function () {
  try {
    var THEMES = ["peacock","lotus","indigo","henna","yoga","tanjore","khadi","terracotta","ikkat","tiger"];
    var t = localStorage.getItem("nid-theme");
    if (THEMES.indexOf(t) === -1) t = "peacock";
    var a = localStorage.getItem("nid-appearance");
    if (a !== "light" && a !== "dark") {
      a = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    var r = document.documentElement;
    r.setAttribute("data-theme", t);
    r.setAttribute("data-appearance", a);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "peacock");
    document.documentElement.setAttribute("data-appearance", "light");
  }
})();
`;

export function HeadShell() {
  return (
    <>
      <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://use.typekit.net/svx1oks.css" />
      {/* Body face (Tonos, final — docs/STAGE-0-NOTES.md) ships in the same
          Typekit kit linked above, so stylesheetUrl is null and this block
          renders nothing; it exists for a future face hosted elsewhere.
          Swap it via design/generate.py's BODY_FACE, never here. */}
      {BODY_FONT_STYLESHEET_URL && (
        <>
          {BODY_FONT_PRECONNECT.map((p) => (
            <link
              key={p.origin}
              rel="preconnect"
              href={p.origin}
              crossOrigin={p.crossOrigin ? "anonymous" : undefined}
            />
          ))}
          <link rel="stylesheet" href={BODY_FONT_STYLESHEET_URL} />
        </>
      )}
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
    </>
  );
}
