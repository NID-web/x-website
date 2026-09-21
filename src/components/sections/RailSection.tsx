// `type: "rail"` — people under a section title and body (NID-CONTEXT §8.2).
// History's Faculty Stalwarts band (4374:188728 body, 4374:188741… cards,
// 4374:188729 CTA) is the first to render one; the faculty directory's four
// groupings are Stage 3.
import { GridItem } from "@/components/layout/GridItem";
import { PersonCard } from "@/components/cards/PersonCard";
import { Title } from "@/components/spine/Title";
import { LinkStack, SectionBody, type BodyClamp } from "@/components/sections/parts";
import type { Section } from "@/lib/content-model";

type RailSectionData = Extract<Section, { type: "rail" }>;

export function RailSection({
  section,
  clamp,
}: {
  section: RailSectionData;
  clamp?: BodyClamp;
}) {
  // TODO(review): Stage 3 — a grouped rail. Its data arrives already bucketed
  // in `PageResponse.groupedItems` (top-level, keyed by section id), and each
  // group label is a rendered element with its own place in the grid; bucketing
  // `items` here would be the client-side grouping CLAUDE.md forbids. Needs the
  // faculty directory boards before a layout can be chosen.
  if (section.groupBy !== "none") return null;

  return (
    // A subgrid, as CardsSection: the CTA is pinned to the section's own
    // title row, which the page grid cannot name.
    <GridItem as="section" span={4} subgrid>
      <Title variant="section">{section.title}</Title>
      {section.body && <SectionBody body={section.body} clamp={clamp} />}

      {/* Two-up at every width: columns 2–3 at 3 and 4 columns (the 1440 board
          leaves column 4 empty beside them, 4374:188741…), the two page tracks
          at 2, and still two at 1 column (4377:185369, 171 + 16 + 171) —
          NID-CONTEXT §5.3's "portraits stay two". The page grid has one track
          at 1 column, so there the wrapper is a two-column grid of its own; it
          adds no margin or gutter the page does not already have, and from
          `tablet` up `contents` dissolves it so each card sits on the page's
          own tracks. The even cards pin column 2 wherever a rail exists. */}
      <div className="col-span-full grid grid-cols-2 gap-x-gutter gap-y-rowgutter tablet:contents">
        {section.items.map((person, i) => (
          <GridItem key={person.id} span={1} start={i % 2 === 0 ? 2 : undefined}>
            <PersonCard person={person} />
          </GridItem>
        ))}
      </div>

      {/* After the cards in source order: stacked below them at 1–2 columns
          (the 390 board, 4377:185354) and under them in column 2 at 3
          (STAGE-0-NOTES §37); `utility` lifts it to column 4 of the title row
          at 4. */}
      {section.links.length > 0 && (
        <GridItem span={1} place="utility">
          <LinkStack links={section.links} />
        </GridItem>
      )}
    </GridItem>
  );
}
