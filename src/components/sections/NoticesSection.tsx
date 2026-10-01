import { GridItem } from "@/components/layout/GridItem";
import { LinkedRow } from "@/components/cards/LinkedRow";
import { Title } from "@/components/spine/Title";
import { LinkStack } from "@/components/sections/parts";
import type { Link } from "@/lib/content-model";
import type { NoticeEntry } from "@/lib/content/editorial";

/**
 * A list of notices (STAGE-0-NOTES §73): the title in column 1, the rows in
 * columns 2–3, the section's links in the utility slot. Each row is the
 * LinkedRow shell, unlinked — title over date, 1px rule below. A NoticeEntry has
 * no URL or machine date yet, so no row is an anchor and no date is a `<time>`.
 */
export function NoticesSection({
  title,
  notices,
  links,
}: {
  title: string;
  notices: NoticeEntry[];
  links: Link[];
}) {
  return (
    // A subgrid, as RailSection: the links are pinned to the section's own
    // title row, which the page grid cannot name.
    <GridItem as="section" span={4} subgrid>
      <Title variant="section">{title}</Title>
      <GridItem span={2} start={2}>
        {/* 56px rows at a 72px pitch on the board: 8 + 20 + 4 + 15.5 + 7 + the
            1px rule, then a 16px gap. */}
        <ul className="flex flex-col gap-4">
          {notices.map((notice) => (
            <LinkedRow key={notice.id} className="flex flex-col gap-1">
              <span className="font-primary text-label text-text-primary">{notice.title}</span>
              {/* TODO(designer): the board sets the date in an accent. A date is
                  content, and no accent is AA for text at Label/Micro size in
                  every theme, so it is text/tertiary — Home's calendar row and
                  ArchiveRow do the same. */}
              <span className="font-primary text-micro text-text-tertiary">{notice.date}</span>
            </LinkedRow>
          ))}
        </ul>
      </GridItem>
      {links.length > 0 && (
        <GridItem span={1} place="utility">
          <LinkStack links={links} />
        </GridItem>
      )}
    </GridItem>
  );
}
