// `type: "rail"` — people under a section title and body (NID-CONTEXT §8.2).
// History's Faculty Stalwarts band (4374:188728 body, 4374:188741… cards,
// 4374:188729 CTA) is the first to render one; the faculty directory's four
// groupings are Stage 3.
import clsx from "clsx";
import { Fragment } from "react";
import { GridItem } from "@/components/layout/GridItem";
import { PersonCard } from "@/components/cards/PersonCard";
import { Title } from "@/components/spine/Title";
import { LinkStack, SectionBody, type BodyClamp } from "@/components/sections/parts";
import type { Section } from "@/lib/content-model";

type RailSectionData = Extract<Section, { type: "rail" }>;

/** A group as the data layer delivers it (`PageResponse.groupedItems`): the
 *  model's `{ label, items }`, plus the faculty directory's second line under a
 *  discipline — its campus (getFaculty.ts). */
export type RailGroup = { label: string; sublabel?: string; items: unknown[] };

/** Each row of three opens at column 2: every second card at three columns,
 *  every third at four — the discipline board's Faculty (§72). */
const threeUpStart = (i: number) =>
  clsx(i % 2 === 0 ? "laptop:col-start-2" : "laptop:col-start-auto", i % 3 === 0 ? "desktop:col-start-2" : "desktop:col-start-auto");

export function RailSection({
  section,
  clamp,
  threeUp = false,
  overline = false,
  groups,
}: {
  section: RailSectionData;
  clamp?: BodyClamp;
  /** Three across in columns 2–4 at four columns, two in 2–3 at three — the
   *  discipline board's Faculty (STAGE-0-NOTES §72). Two-up otherwise. */
  threeUp?: boolean;
  /** Each person's designation as the overline above the name (§60). */
  overline?: boolean;
  /** A grouped rail's groups, already grouped by the data layer — never
   *  bucketed here (CLAUDE.md, §66). */
  groups?: RailGroup[];
}) {
  // A grouped rail: the faculty directory (STAGE-0-NOTES §82). Each group is
  // its cell in column 1 — the group's name in Heading/2, the discipline's
  // campus under it — beside its people three across in columns 2–4, every
  // group opening a new row; a short group leaves its row's last cells empty.
  // Below three columns the cell is a full row above its cards, which keep the
  // rail's two-up (NID-CONTEXT §5.3: portraits stay two).
  if (section.groupBy !== "none") {
    if (!groups?.length) return null;
    return (
      <GridItem as="section" span={4} subgrid>
        {section.title && <Title variant="section">{section.title}</Title>}
        {groups.map((group, g) => (
          <Fragment key={g}>
            <GridItem span="full-then-1" start={1} className="flex flex-col gap-1">
              <h2 className="font-primary text-h2 text-text-tertiary">{group.label}</h2>
              {/* text/tertiary, not the board's text/quaternary: the campus is
                  meaning, and quaternary is below AA by design (§73's notice
                  dates). TODO(designer). */}
              {group.sublabel && <p className="font-primary text-label text-text-tertiary">{group.sublabel}</p>}
            </GridItem>
            <div className="col-span-full grid grid-cols-2 gap-x-gutter gap-y-rowgutter tablet:contents">
              {(group.items as RailSectionData["items"]).map((person, i) => (
                <GridItem key={person.id} span={1} className={threeUpStart(i)}>
                  {/* The first row is above the fold: eager, the rest lazy. */}
                  <PersonCard person={person} overline={overline} wrapOverline priority={g === 0 && i < 3} />
                </GridItem>
              ))}
            </div>
          </Fragment>
        ))}
      </GridItem>
    );
  }

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
        {section.items.map((person, i) =>
          threeUp ? (
            // Each row opens at column 2: every second card at three columns,
            // every third at four.
            <GridItem key={person.id} span={1} className={threeUpStart(i)}>
              <PersonCard person={person} overline={overline} wrapOverline />
            </GridItem>
          ) : (
            <GridItem key={person.id} span={1} start={i % 2 === 0 ? 2 : undefined}>
              <PersonCard person={person} overline={overline} />
            </GridItem>
          ),
        )}
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
