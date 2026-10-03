// /people/faculty — the faculty directory's FIXTURE (STAGE-0-NOTES §82): a copy
// of real CMS records, small enough to read, enough to exercise every view.
// Three disciplines on three campuses (their records' shortName, campus, design
// faculty and faculty members), the nine people they list, and Shilpa Das, who
// is in the CMS's faculty list but in no discipline: she exercises "Other
// faculty". LIVE reads the full set from the same two sources: the `faculty`
// document's list and the discipline records (getFaculty.ts).
//
// Names, role lines and portraits are the CMS's, copied (the portraits resized
// to 288px, the 144px circle at 2×). Nothing here is a hand-made mapping: every
// group comes from a discipline record's own fields.
import type { UUID } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";

export interface FacultyPersonSource {
  slug: string;
  name: string;
  /** The CMS list item's heroText: the role line the card's overline shows. */
  role?: string;
  photo?: ReturnType<typeof mediaAsset>;
}

export interface FacultyDisciplineSource {
  slug: string;
  name: string;
  campus: UUID;
  faculty: string;
  members: string[];
}

const person = (slug: string, name: string, role: string): FacultyPersonSource => ({
  slug,
  name,
  role,
  // TODO(review): the alt text is the person's name, the CMS's (§81).
  photo: mediaAsset(`/people/faculty/${slug}.jpg`, name, 288, 288),
});

export const FACULTY_FIXTURE: {
  title: string;
  people: FacultyPersonSource[];
  disciplines: FacultyDisciplineSource[];
} = {
  title: "Faculty",
  // The faculty document's list order (alphabetical by slug, as the CMS sends it).
  people: [
    person("ajay-kumar-tiwari", "Ajay Kumar Tiwari", "Discipline Lead, Animation Film Design"),
    person("amarnath-praful", "Amarnath Praful", "Discipline Faculty, Photography Design"),
    person("athul-dinesh", "Athul Dinesh", "Discipline Faculty, Interaction Design"),
    person("dhiman-sengupta", "Dhiman Sengupta", "Discipline Faculty, Animation Film Design"),
    person("jagriti-p-galphade", "Jagriti P Galphade", "Discipline Lead, Interaction Design"),
    person("kaushik-chakraborty", "Kaushik Chakraborty", "Discipline Faculty, Animation Film Design"),
    person("mamata-n-rao", "Dr Mamata N. Rao", "Activity Chairperson, Knowledge Management Centre (KMC)"),
    person("rishi-singhal", "Rishi Singhal", "Discipline Lead, Photography Design"),
    person("saurabh-srivastava", "Saurabh Srivastava", "Head, Information Technology"),
    person("shilpa-das", "Shilpa Das", "Faculty of Interdisciplinary Design Studies (IDDS)"),
  ],
  disciplines: [
    {
      slug: "animation-film-design-bdes",
      name: "Animation Film Design",
      campus: PAGE_ID.campusAhmedabad,
      faculty: "Communication Design",
      members: ["kaushik-chakraborty", "ajay-kumar-tiwari", "dhiman-sengupta"],
    },
    {
      slug: "interaction-design-mdes",
      name: "Interaction Design",
      campus: PAGE_ID.campusBengaluru,
      faculty: "IT Integrated Design",
      members: ["athul-dinesh", "jagriti-p-galphade", "mamata-n-rao"],
    },
    {
      slug: "photography-design-mdes",
      name: "Photography Design",
      campus: PAGE_ID.campusGandhinagar,
      faculty: "Communication Design",
      members: ["amarnath-praful", "rishi-singhal", "saurabh-srivastava"],
    },
  ],
};
