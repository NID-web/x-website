import { Main } from "@/components/spine/Main";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("NotFound");

  return (
    <Main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-page text-text-primary">
      {/* The page's one <h1> (STAGE-0-NOTES §107), styled as the <p> it replaced.
          TODO(review): no route renders this file today — every unknown path,
          and a missing article, lab or discipline, gets app/not-found.tsx. */}
      <h1 className="font-body text-body">{t("message")}</h1>
      <Link href="/" className="font-body text-body underline">
        {t("home")}
      </Link>
    </Main>
  );
}
