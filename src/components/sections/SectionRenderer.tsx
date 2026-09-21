import type { Section } from "@/lib/content-model";
import type { BodyClamp } from "@/components/sections/parts";
import { CardsSection } from "@/components/sections/CardsSection";
import { LinksSection } from "@/components/sections/LinksSection";
import { RailSection } from "@/components/sections/RailSection";
import { TextSection } from "@/components/sections/TextSection";

/** The model's rule: a section with no body, image, links or items renders
 *  nothing (NID-CONTEXT §8.3). Exported so a page can skip the separator too. */
export function hasContent(s: Section) {
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
  clamp,
  imagePlaceholder,
  pattern,
  patternSeed,
  linksLayout,
}: {
  section: Section;
  lead?: "wide" | "feature";
  /** Passed straight to TextSection (and `clamp` to RailSection); see the notes
   *  on its props. */
  clamp?: BodyClamp;
  imagePlaceholder?: boolean;
  pattern?: boolean;
  patternSeed?: number;
  /** Passed to LinksSection. */
  linksLayout?: "flow" | "two-up";
}) {
  if (!hasContent(section)) return null;
  switch (section.type) {
    case "text":
      return (
        <TextSection
          section={section}
          clamp={clamp}
          imagePlaceholder={imagePlaceholder}
          pattern={pattern}
          patternSeed={patternSeed}
        />
      );
    case "links":
      return <LinksSection section={section} layout={linksLayout} />;
    case "cards":
      return (
        <CardsSection section={section} lead={lead} patternSeed={patternSeed} clamp={clamp} />
      );
    case "rail":
      return <RailSection section={section} clamp={clamp} />;
    case "files":
    case "mosaic":
      return null;
  }
}
