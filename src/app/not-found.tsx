import type { Metadata } from "next";
import Link from "next/link";
import { HeadShell } from "./head-shell";
import "./globals.css";

// Reached only for a request the proxy's matcher doesn't rewrite into a
// locale segment. It gets its own <html> (see src/app/layout.tsx) but
// shares HeadShell, so the first frame is still themed correctly.
export const metadata: Metadata = {
  title: "Not found — National Institute of Design",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadShell />
      </head>
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-page text-text-primary">
          <p className="font-body text-body">That page doesn&apos;t exist.</p>
          <Link href="/en" className="font-body text-body underline">
            National Institute of Design
          </Link>
        </main>
      </body>
    </html>
  );
}
