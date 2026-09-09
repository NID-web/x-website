// The single source for everything that must run before first paint,
// shared by every <html> tree in the app (locale layout and the global
// not-found page) so they can never paint a different first frame.

import fontManifestRaw from "@/lib/font-manifest.json";

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
