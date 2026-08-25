import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// output: "export" only applies when explicitly building for GitHub Pages
// (see .github/workflows/deploy-pages.yml and `npm run build:pages`). The default
// `npm run build` stays a normal server build — required by `next start`,
// which scripts/verify-{tokens,fonts,screenshot}.mjs all spawn to test
// against a real server. Static export can't run src/proxy.ts at all
// (Next's own static-export docs list Proxy under "Unsupported Features")
// or next.config's own redirects/headers, so a GitHub Pages build behaves
// differently at the edges (see public/index.html and docs/STAGE-0-NOTES.md
// §13) — that's the trade this flag makes, deliberately, only when asked for.
const isPagesExport = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isPagesExport
    ? {
        output: "export",
        basePath: process.env.PAGES_BASE_PATH ?? "",
        trailingSlash: true,
      }
    : {}),
};

export default withNextIntl(nextConfig);
