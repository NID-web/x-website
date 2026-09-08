import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Header } from "@/components/header/Header";
import { PatternShimmer } from "@/components/home/PatternShimmer";
import { NavTrail } from "@/components/spine/NavTrail";
import { HeadShell } from "../head-shell";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "National Institute of Design",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <HeadShell />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            {/* Records the route on EVERY page so the next page's BackNav can
                name this one — including pages that show no back link
                themselves (src/lib/nav-trail.ts). */}
            <NavTrail />
            {/* Lets a hovered craft sub-pattern finish its shimmer after the
                pointer leaves. One delegated listener for every pattern tile
                on the site (src/components/home/PatternShimmer.tsx). */}
            <PatternShimmer />
            <Header />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
