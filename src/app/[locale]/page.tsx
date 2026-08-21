import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Stage 0 has no page content or CMS wiring yet (see CLAUDE.md § Build
// order). This placeholder exists only so `/en` resolves to something;
// the actual acceptance surface for this stage is /en/swatch.
export default async function HomePage() {
  const t = await getTranslations("Swatch");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-page text-text-primary">
      <p className="font-body text-body">
        Stage 0 — foundations only. No page content yet.
      </p>
      <Link href="/swatch" className="font-body text-body underline">
        {t("title")}
      </Link>
    </main>
  );
}
