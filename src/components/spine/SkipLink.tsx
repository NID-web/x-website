import { MAIN_ID } from "@/components/spine/Main";

/**
 * The first tab stop on every page: jumps past the header to the page's main
 * content (WCAG 2.4.1). Invisible until focused, then drawn as a pill over the
 * header's left edge, the header Apply pill's surface and type, raised above
 * the header (z-40) and the menu drawer's layer (z-50).
 */
export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href={`#${MAIN_ID}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-4 focus:z-[60] focus:inline-flex focus:h-8 focus:items-center focus:rounded-pill focus:bg-surface-page focus:px-4 focus:font-primary focus:text-h6 focus:text-text-primary focus:no-underline focus:shadow-lg focus:ring-1 focus:ring-border-subtle"
    >
      {label}
    </a>
  );
}
