import { getTranslations } from "next-intl/server";
import { GridItem } from "@/components/layout/GridItem";
import { PatternTile } from "@/components/home/tiles/PatternTile";
import { Title } from "@/components/spine/Title";
import { LinkStack } from "@/components/sections/parts";
import type { DerivedPageContext } from "@/lib/content-model";

// "More in <parent>" — derived.siblingBand, the band every secondary page
// closes on before the footer (NID-CONTEXT.md §8.4, node 4315:276612). Not a
// section: it is derived data, so it never appears in Page.sections and the
// page places it itself.
//
// It renders NOTHING when there are no siblings — the model is explicit that an
// empty band must not reach the page at all.
export async function SiblingBand({
  items,
  parentTitle,
}: {
  items: DerivedPageContext["siblingBand"];
  parentTitle: string;
}) {
  if (items.length === 0) return null;
  const t = await getTranslations("Page");
  const headingId = "sibling-band-heading";

  return (
    <>
      <Title variant="section" id={headingId}>
        {t("moreIn", { section: parentTitle })}
      </Title>
      <GridItem span={2} start={2} as="nav" aria-labelledby={headingId}>
        <LinkStack
          links={items.map((sibling) => ({ label: sibling.title, href: sibling.href }))}
          twoUp="tablet-up"
        />
      </GridItem>
      <GridItem span={1} className="hidden desktop:block">
        <PatternTile seed={1} />
      </GridItem>
    </>
  );
}
