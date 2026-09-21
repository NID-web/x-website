import { getTranslations } from "next-intl/server";
import { GridItem } from "@/components/layout/GridItem";
import { PatternTile } from "@/components/home/tiles/PatternTile";
import { Title } from "@/components/spine/Title";
import { LinkStack } from "@/components/sections/parts";
import type { DerivedPageContext } from "@/lib/content-model";

/**
 * Sibling page navigation band placed before the footer on secondary pages.
 */
export async function SiblingBand({
  items,
  parentTitle,
  title,
  pattern = true,
}: {
  items: DerivedPageContext["siblingBand"];
  parentTitle: string;
  /** Replaces "More in {parent}" where a board names the band itself —
   *  "Other campuses" on the three campus pages (4315:276798). */
  title?: string;
  /** The craft tile after the links. On by default; see TextSection's
   *  `pattern`. */
  pattern?: boolean;
}) {
  if (items.length === 0) return null;
  const t = await getTranslations("Page");
  const headingId = "sibling-band-heading";

  return (
    <>
      <Title variant="section" id={headingId}>
        {title ?? t("moreIn", { section: parentTitle })}
      </Title>
      <GridItem span={2} start={2} as="nav" aria-labelledby={headingId}>
        <LinkStack
          links={items.map((sibling) => ({ label: sibling.title, href: sibling.href }))}
          twoUp="tablet-up"
        />
      </GridItem>
      {pattern && (
        <GridItem span="full-then-1">
          <PatternTile seed={1} band />
        </GridItem>
      )}
    </>
  );
}
