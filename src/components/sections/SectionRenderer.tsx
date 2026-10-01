import type { Section } from "@/lib/content-model";
import { isDisciplineCard, isNoticeEntry, isStudentWorkCard } from "@/lib/content/editorial";
import type { BodyClamp } from "@/components/sections/parts";
import { CardsSection } from "@/components/sections/CardsSection";
import { GroupedCards } from "@/components/sections/GroupedCards";
import { StudentWorkSection } from "@/components/sections/StudentWorkSection";
import { LinksSection } from "@/components/sections/LinksSection";
import { NoticesSection } from "@/components/sections/NoticesSection";
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
  thumbs,
  groups,
  filledLinks,
  railThreeUp,
  railOverline,
  split,
  utilityLinks,
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
  /** Passed to CardsSection. */
  thumbs?: "two-up" | "three-up";
  /** This section's groups from `PageResponse.groupedItems`, already grouped:
   *  a cards section with groups renders as GroupedCards. */
  groups?: Array<{ label: string; items: unknown[] }>;
  /** Passed to TextSection. */
  filledLinks?: boolean;
  /** Passed to RailSection (the discipline pages' Faculty). */
  railThreeUp?: boolean;
  railOverline?: boolean;
  /** Passed to TextSection (the discipline pages' Resources). */
  split?: boolean;
  /** Passed to TextSection (the primary template's sections). */
  utilityLinks?: boolean;
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
          filledLinks={filledLinks}
          split={split}
          utilityLinks={utilityLinks}
        />
      );
    case "links":
      return <LinksSection section={section} layout={linksLayout} />;
    case "cards":
      // A discipline's student works (editorial.ts): the feature and thumbs.
      {
        const works = (section.items as unknown[]).filter(isStudentWorkCard);
        if (works.length && works.length === section.items.length) {
          return <StudentWorkSection title={section.title} body={section.body} works={works} />;
        }
        // A list of notices (editorial.ts), /study's Academic Notifications.
        const notices = (section.items as unknown[]).filter(isNoticeEntry);
        if (notices.length && notices.length === section.items.length) {
          return <NoticesSection title={section.title} notices={notices} links={section.links} />;
        }
      }
      if (groups?.length) {
        return (
          <GroupedCards
            title={section.title}
            groups={groups.map((g) => ({ label: g.label, items: g.items.filter(isDisciplineCard) }))}
          />
        );
      }
      return (
        <CardsSection
          section={section}
          lead={lead}
          patternSeed={patternSeed}
          clamp={clamp}
          thumbs={thumbs}
        />
      );
    case "rail":
      return <RailSection section={section} clamp={clamp} threeUp={railThreeUp} overline={railOverline} />;
    case "files":
    case "mosaic":
      return null;
  }
}
