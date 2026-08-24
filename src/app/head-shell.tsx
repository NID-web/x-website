// The single source for everything that must run before first paint,
// shared by every <html> tree in the app (locale layout and the global
// not-found page) so they can never paint a different first frame.

import fontManifest from "@/lib/font-manifest.json";

// The body face's stylesheet URL lives only in font-manifest.json (generated
// from design/generate.py's BODY_FACE) — never hardcoded here, so swapping
// the face is a generate.py + copy step, not a HeadShell edit.
const BODY_FONT_STYLESHEET_URL = fontManifest.body.stylesheetUrl;

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
      {/* Body face — provisional (docs/STAGE-0-NOTES.md), loaded from Google
          Fonts rather than the Typekit kit. next/font isn't used yet: that
          would put the family name back into TypeScript, breaking the
          one-place rule this face is deliberately kept out of until it's
          final. Swap it via design/generate.py's BODY_FACE, not here. */}
      {BODY_FONT_STYLESHEET_URL && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={BODY_FONT_STYLESHEET_URL} />
        </>
      )}
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
    </>
  );
}
