import { GridItem } from "@/components/layout/GridItem";

/**
 * Pull quote in columns 2–3: a 2px accent rule, the quote beside it, an optional
 * attribution beneath — the library's Blockquote (NID-CONTEXT §7). A quotation,
 * so a real <blockquote>, not a styled paragraph.
 */
export function Blockquote({ quote, attribution }: { quote: string; attribution?: string }) {
  return (
    <GridItem span={2} start={2} as="figure" className="flex gap-6 py-8">
      <span aria-hidden="true" className="w-0.5 shrink-0 self-stretch rounded-[1px] bg-accent-primary" />
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {/* TODO(review): designer — accent/pentenary is the board's colour and
            clears 3:1 in no light theme (2.59–2.96 against surface/page, every
            dark theme passes 4.5:1; STAGE-0-NOTES §60). CLAUDE.md reserves the
            decorative accents for decoration, and a quote carries meaning.
            Shipped as drawn pending that call. */}
        <blockquote className="font-secondary text-display-quote italic text-accent-pentenary">
          {quote}
        </blockquote>
        {attribution && (
          <figcaption className="font-primary text-label text-text-quaternary">
            {attribution}
          </figcaption>
        )}
      </div>
    </GridItem>
  );
}
