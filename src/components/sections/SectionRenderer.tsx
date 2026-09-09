import type { Section } from "@/lib/content-model";
import { CardsSection } from "@/components/sections/CardsSection";
import { LinksSection } from "@/components/sections/LinksSection";
import { TextSection } from "@/components/sections/TextSection";

function hasContent(s: Section) {
  return (
    Boolean(s.body?.trim()) || Boolean(s.image) || s.links.length > 0 || s.items.length > 0
  );
}

/**
 * Dispatches a content Section to its appropriate renderer.
 */
export function SectionRenderer({
  section,
  lead,
}: {
  section: Section;
  lead?: "wide" | "feature";
}) {
  if (!hasContent(section)) return null;
  switch (section.type) {
    case "text":
      return <TextSection section={section} />;
    case "links":
      return <LinksSection section={section} />;
    case "cards":
      return <CardsSection section={section} lead={lead} />;
    case "files":
    case "rail":
    case "mosaic":
      return null;
  }
}
