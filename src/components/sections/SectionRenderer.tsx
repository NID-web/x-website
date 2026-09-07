import type { Section } from "@/lib/content-model";
import { CardsSection } from "@/components/sections/CardsSection";
import { LinksSection } from "@/components/sections/LinksSection";
import { TextSection } from "@/components/sections/TextSection";

// The switch (NID-CONTEXT.md §8.3). Each section component emits GridItems
// straight into the page's one grid — no wrapper, or the rail alignment is
// lost. A section with nothing in it renders nothing: an empty scaffold reads
// as neglect, not brevity.
function hasContent(s: Section) {
  return (
    Boolean(s.body?.trim()) || Boolean(s.image) || s.links.length > 0 || s.items.length > 0
  );
}

export function SectionRenderer({ section }: { section: Section }) {
  if (!hasContent(section)) return null;
  switch (section.type) {
    case "text":
      return <TextSection section={section} />;
    case "links":
      return <LinksSection section={section} />;
    case "cards":
      return <CardsSection section={section} />;
    case "files":
    case "rail":
    case "mosaic":
      // TODO(review): files is Stage 4, rail Stage 3, mosaic Stage 5
      // (CLAUDE.md § Build order). A page that carries one before then shows
      // the gap rather than an empty scaffold.
      return null;
  }
}
