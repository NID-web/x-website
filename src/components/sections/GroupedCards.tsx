import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { GridItem } from "@/components/layout/GridItem";
import { ThumbCardView } from "@/components/cards/ThumbCard";
import { Separator } from "@/components/spine/Separator";
import { Title } from "@/components/spine/Title";
import { campusName } from "@/lib/content/campus-names";
import type { DisciplineCard } from "@/lib/content/editorial";

/**
 * A cards section that arrives grouped (`PageResponse.groupedItems`, built in
 * getPage — never bucketed here): a programme's disciplines by faculty. The
 * section title holds column 1; each group's title column 2 and its cards two
 * across in columns 3–4, a separator between groups (the B.Des board). At three
 * columns the cards reflow two across into columns 2–3 below their title; at
 * two and one they flow full width. Nothing is reordered.
 */
export async function GroupedCards({
  title,
  groups,
}: {
  title: string;
  groups: Array<{ label: string; items: DisciplineCard[] }>;
}) {
  const t = await getTranslations("Page");
  // "{campus} / {n} seats", or the campus alone; the campus names are the
  // campus pages' own (campus-names.ts). Never the board's filler seats.
  const meta = (item: DisciplineCard) => {
    const campuses = item.campuses.flatMap((id) => campusName(id) ?? []).join(", ");
    return item.seats ? `${campuses} / ${t("seats", { count: item.seats })}` : campuses;
  };
  return (
    <GridItem as="section" span={4} subgrid>
      <Title variant="section">{title}</Title>
      {groups.map((group, g) => (
        <Fragment key={group.label}>
          {g > 0 && <Separator />}
          <GridItem span="full-then-1" start={2}>
            <h3 className="font-primary text-h5 text-text-tertiary">{group.label}</h3>
          </GridItem>
          {group.items.map((item, i) => (
            <GridItem
              key={item.id}
              span={1}
              // Each pair opens its row: column 3 at four columns, column 2 at
              // three (below the group title). Flow below that.
              className={i % 2 === 0 ? "laptop:col-start-2 desktop:col-start-3" : undefined}
            >
              {/* Unlinked: no discipline page is built yet (`page` unset). */}
              <ThumbCardView title={item.name} meta={meta(item)} image={item.image} heading="h4" />
            </GridItem>
          ))}
        </Fragment>
      ))}
    </GridItem>
  );
}
