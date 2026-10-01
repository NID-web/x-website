// /study/notifications — Academic Notifications (the 1440 board), Admission
// Process's pattern with one section: a list of documents (STAGE-0-NOTES §76).
//
// LIVE, the CMS's "Notifications" section is the list, whole: its LINK blocks
// in CMS order with CMS labels (linkBlocks into a `links` section), each file
// checked before the page renders. FIXTURE, the board's labels on the same
// files. The rail's Type and the contacts are the fixture's in both modes.
// TODO(review): live slots the fixture fills — Type, the contacts.
//
// No "Last updated" row: the document has no updatedAt, and a hard-coded date
// goes stale silently. publishedAt is a publish date, not an update.
import type { Link, PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { studyBand } from "@/lib/content/sibling-bands";
import { mediaAsset } from "@/lib/media";

const PUBLISHED = "2026-10-01T00:00:00+05:30";
const PATH = "/study/notifications";

const file = (id: string, label: string, name: string): Link => ({
  id: `link-notification-${id}`,
  label,
  targetType: "external",
  url: `https://www.nid.edu/public/documents/${name}.pdf`,
});

export const STUDY_NOTIFICATIONS: PageResponse = {
  page: {
    id: PAGE_ID.studyNotifications,
    title: "Academic Notifications",
    slug: "notifications",
    parent: PAGE_ID.study,
    template: "secondary",
    utility: "back",
    // TODO(review): from the board; the CMS has no type field.
    keyInfo: [{ label: "Type", value: "Notifications, circulars & forms" }],
    hero: [
      // The CMS's academic-notifications-hero-1.jpg. TODO(review): the alt text
      // is ours; the CMS's says only "National Institute of Design".
      mediaAsset(
        "/study/notifications/hero-nid-entrance.jpg",
        "The National Institute of Design's entrance, its name in Hindi and English on a brick wall beside the gate.",
        1520,
        700,
      ),
    ],
    intro: "Academic notifications, circulars and forms for current and prospective students.",
    sections: [
      {
        id: "section-notifications-downloads",
        page: PAGE_ID.studyNotifications,
        order: 1,
        type: "links",
        title: "Downloads",
        // TODO(review): content — fee notices for 2018, 2019 and 2020 sit beside
        // 2026-27; the CMS lists the same six.
        items: [
          file("calendar-2026-27", "Academic Calendar 2026-27 - B.Des and M.Des Programmes", "iQbbHSnpgS"),
          file("tcsion-manual", "TCSiON Fee Payment User Manual", "bLRrW3e93x"),
          file("fees-2020", "Fees Notice for Regular Student B. Des and M. Des 2020", "KyfQ4Culr5"),
          file("fees-2018-2019", "Fees Notice for Regular Student 2018 and 2019", "72JOUItjsp"),
          file("fees-overseas", "Fees Notice for Overseas Students", "TX11ROgVhA"),
          file("st-fellowship", "National Fellowship and Scholarship for Higher Education of ST Students", "fyZYRUun4R"),
        ],
        links: [],
        // TODO(review): confirm edudoc@nid.edu and the number; the CMS has neither.
        contacts: [
          { label: "Email", value: "edudoc@nid.edu" },
          { label: "Phone", value: "+91 79 2662 9500" },
        ],
      },
    ],
    contacts: [],
    seoTitle: "Academic Notifications",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.study, title: "Study at NID", path: "/study" },
      { id: PAGE_ID.studyNotifications, title: "Academic Notifications", path: PATH },
    ],
    backNav: { label: "Study at NID", href: "/study" },
    subPageLinks: [],
    // sitemap.json's order minus this page. TODO(designer): the board lists PM
    // Vidyalaxmi Scheme second.
    siblingBand: studyBand(PATH),
  },
};
