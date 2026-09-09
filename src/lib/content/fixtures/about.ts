// /about — About NID landing page content fixture.
import type { Page, PageResponse, Section } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";

const PUBLISHED = "2026-07-23T00:00:00+05:30";

/** An index stub for a child page: what a card needs and nothing more.
 *  TODO(review): `sections` is required and "at least one", but a card never
 *  reads it — the response should carry index stubs, not whole pages. */
function stub(
  page: Pick<Page, "id" | "title" | "slug" | "parent" | "hero"> & Partial<Page>,
): Page {
  return {
    template: "secondary",
    utility: "back",
    keyInfo: [],
    sections: [],
    contacts: [],
    publishedAt: PUBLISHED,
    ...page,
  };
}

const NEWS: Section = {
  id: "section-about-news",
  page: PAGE_ID.about,
  order: 1,
  type: "cards",
  title: "News & Events",
  // TODO(review): cards union lacks NewsArticle — headline, date and thumbnail
  // ride on Page.title, Page.publishedAt and Page.hero[0]; `featured` has no
  // home, so the first item is the lead by position.
  items: [
    stub({
      id: "news-north-east-artisans",
      title: "North-East Artisans Honoured by Hon’ble President of India at Rashtrapati Bhavan",
      slug: "north-east-artisans",
      parent: PAGE_ID.newsEvents,
      hero: [
        mediaAsset(
          "/about/news-artisans.jpg",
          "The President of India presenting an award to an artisan at Rashtrapati Bhavan.",
          1200,
          526,
        ),
      ],
    }),
    stub({
      id: "news-drawing-dialogues-2026",
      title: "Drawing Dialogues happening at NID very soon. Register!",
      slug: "drawing-dialogues-2026",
      parent: PAGE_ID.newsEvents,
      hero: [
        mediaAsset(
          "/about/news-drawing-dialogues.jpg",
          "Drawing Dialogues 2026 poster on a blue leaf-vein background.",
          1201,
          527,
        ),
      ],
    }),
    stub({
      // The About board draws this card as "Lorem ipsum"; the News & Events
      // board (4199:303914) names it, on a byte-identical photo.
      id: "news-incubation-centre",
      title: "Inauguration of the Incubation and Innovation Centre at NID Gandhinagar Campus",
      slug: "incubation-innovation-centre",
      parent: PAGE_ID.newsEvents,
      hero: [
        mediaAsset(
          "/about/news-address.jpg",
          "A speaker addressing the inauguration from a lectern in a wood-panelled hall.",
          1200,
          526,
        ),
      ],
    }),
  ],
  links: [
    { id: "link-all-news", label: "All News & Events", targetType: "page", page: PAGE_ID.newsEvents },
  ],
  contacts: [],
};

const CAMPUSES: Section = {
  id: "section-about-campuses",
  page: PAGE_ID.about,
  order: 2,
  type: "cards",
  title: "Campuses",
  // TODO(review): cards union lacks Campus — name and photo ride on Page.title
  // and Page.hero[0].
  items: [
    stub({
      id: "campus-ahmedabad",
      title: "Ahmedabad",
      slug: "ahmedabad",
      parent: PAGE_ID.campuses,
      hero: [mediaAsset("/about/campus-ahmedabad.jpg", "The brick entrance wall of the Ahmedabad campus with the NID mark.", 736, 981)],
    }),
    stub({
      id: "campus-gandhinagar",
      title: "Gandhinagar",
      slug: "gandhinagar",
      parent: PAGE_ID.campuses,
      hero: [mediaAsset("/about/campus-gandhinagar.jpg", "Students walking beneath the concrete studio block at Gandhinagar.", 1200, 628)],
    }),
    stub({
      id: "campus-bangalore",
      title: "Bangalore",
      slug: "bengaluru",
      parent: PAGE_ID.campuses,
      hero: [mediaAsset("/about/campus-bangalore.jpg", "The lawn and amphitheatre steps of the Bengaluru campus.", 750, 500)],
    }),
  ],
  links: [],
  contacts: [],
};

const STUDENT_AWARDS: Section = {
  id: "section-about-student-awards",
  page: PAGE_ID.about,
  order: 3,
  type: "cards",
  title: "Student Awards",
  // TODO(review): cards union lacks Person — name, bio and portrait ride on
  // Page.title, Page.intro and Page.hero[0].
  items: [
    stub({
      id: "student-rishaya-palkhivala",
      title: "Rishaya Palkhivala",
      slug: "rishaya-palkhivala",
      parent: PAGE_ID.studentAwards,
      intro:
        "A short film — ‘Sorry For Your Loss’ — by film and video Communication (FVC) M Des student at the National Institute of Design (NID) Ahmedabad was awarded the best film under the National Category of the Satyajit Ray Centenary Student’s Short Film Competition on the theme ‘Realism’.",
      hero: [mediaAsset("/about/alumni-palkhivala.png", "Portrait of Rishaya Palkhivala.", 276, 276)],
    }),
    stub({
      id: "student-mayank-kumar",
      title: "Mayank Kumar",
      slug: "mayank-kumar",
      parent: PAGE_ID.studentAwards,
      intro:
        "Mayank has been awarded the prestigious Dean's Excellence Award for developing an AI-powered accessibility tool that helps visually impaired students navigate campus independently.",
      hero: [mediaAsset("/about/alumni-kumar.png", "Portrait of Mayank Kumar.", 172, 195)],
    }),
  ],
  links: [
    {
      id: "link-student-awards",
      label: "Visit Student Awards Gallery",
      targetType: "page",
      page: PAGE_ID.studentAwards,
    },
  ],
  contacts: [],
};

export const ABOUT: PageResponse = {
  page: {
    id: PAGE_ID.about,
    title: "About NID",
    slug: "about",
    parent: null,
    template: "primary",
    utility: "none",
    keyInfo: [],
    hero: [
      mediaAsset(
        "/about/hero-campus.jpg",
        "A flock of birds over the brick façade of the NID Ahmedabad campus.",
        1520,
        700,
      ),
    ],
    intro:
      "The establishment of NID was a result of several forces, both global and local. The late 1950s saw a confluence of these forces, and this time would be a significant one for Indian culture and education. This was a time of reappraisal and reconstruction in a newly independent India. A young nation was confronted with the mammoth task of nation building, of balancing age-old traditions with modern technology and ideas.",
    sections: [NEWS, CAMPUSES, STUDENT_AWARDS],
    contacts: [{ label: "Read full mandate", value: "/about/charter" }],
    seoTitle: "About NID",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [{ id: PAGE_ID.about, title: "About NID", path: "/about" }],
    backNav: null,
    subPageLinks: [
      { label: "NID’s ‘Mandate’", href: "/about/charter" },
      { label: "Director’s Message", href: "/about/directors-message" },
      { label: "History", href: "/about/history" },
      { label: "Campuses", href: "/about/campuses" },
      { label: "News & Events", href: "/about/news-events" },
      { label: "Our Themes", href: "/about/our-themes" },
    ],
    siblingBand: [],
  },
};
