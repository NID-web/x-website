import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-page text-text-primary">
      <p className="font-body text-body">{t("message")}</p>
      <Link href="/" className="font-body text-body underline">
        {t("home")}
      </Link>
    </main>
  );
}
