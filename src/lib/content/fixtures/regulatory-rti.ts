// /regulatory/rti — Right to Information, the last Regulatory page
// (STAGE-0-NOTES §89). No board: the secondary template by its own rules.
//
// The words are a copy of the CMS's `right-to-information` document as sent
// (6–7 Oct 2026), so FIXTURE and LIVE say the same. LIVE, the officers and
// contacts are the CMS's (`namedContacts`), and "Key Documents" is its LINK
// blocks in CMS order with CMS labels, each file checked before the page
// renders. "On this website" is this site's own index and the fixture's in
// both modes: its rows go through the route gate, so an unbuilt page is no row
// until it is built.
//
// Known limitation: this is not a complete s.4(1)(b) disclosure. The statutory
// blocks nid.edu carries (administrative procedures, budget, accounting, the
// Internal Committee, addresses, previous officers, three tables) are not in
// the CMS, and are not copied here: legal disclosure comes from its owner.
// Backend ask, §89.
import type { Link, PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { regulatoryBand } from "@/lib/content/sibling-bands";

// TODO(review): backend — the CMS's publishedAt is a seed timestamp.
const PUBLISHED = "2026-09-21T08:48:37+05:30";
const PATH = "/regulatory/rti";

/** A row of this site's index: the site's own label for the page (§89). */
const page = (id: string, label: string, target: string): Link => ({
  id: `link-rti-index-${id}`,
  label,
  targetType: "page",
  page: target,
});

// An external PDF row: ↗ and a new tab, no file glyph (§86).
const file = (id: string, label: string, url: string): Link => ({
  id: `link-rti-${id}`,
  label,
  targetType: "external",
  url,
});

export const REGULATORY_RTI: PageResponse = {
  page: {
    id: PAGE_ID.regulatoryRti,
    title: "Right to Information",
    slug: "rti",
    // No /regulatory page: the page hangs off About, where nid.edu files it.
    parent: PAGE_ID.about,
    template: "secondary",
    utility: "back",
    // The officers, named (RTI Act s.4(1)(b)(xvi)): role and name, then that
    // person's contacts as sent (namedContacts, §89).
    keyInfo: [
      { label: "Public Information Officer", value: "Samir More" },
      { label: "Public Information Officer", value: "rti@nid.edu" },
      // TODO(designer): the plain-text row repeats the role as its overline
      // (ContactList's style for a value that is not one dialable number).
      { label: "Public Information Officer", value: "+91-79-2662-9500/9600 Ext: 670" },
      { label: "Departmental Appellate Authority", value: "Dr. Lalitha Poluru" },
      { label: "Departmental Appellate Authority", value: "lalitha_p@nid.edu" },
      { label: "Departmental Appellate Authority", value: "+91-79-2662-9749" },
    ],
    // The CMS's hero has no alt text, so there is none: the page closes up.
    // TODO(review): backend — alt text that describes rti-hero.jpg.
    hero: [],
    intro: "Information disclosure under the Right to Information Act, 2005.",
    sections: [
      {
        id: "section-rti-about",
        page: PAGE_ID.regulatoryRti,
        order: 1,
        type: "text",
        title: "About",
        body:
          "The National Institute of Design (NID) is a premier multi-disciplinary institution offering design education, applied research, training, consultancy services, and outreach programmes. Established in 1961 as an autonomous institution under the Ministry of Commerce and Industry, NID was declared an ‘Institution of National Importance’ by Act of Parliament in July 2014." +
          "\n\n" +
          "NID operates three primary campuses — Ahmedabad (the original campus), Gandhinagar (established 2005), and Bengaluru (established 2007) — along with a Delhi Centre and an Incubator Centre in Bengaluru. Staff classifications include faculty, technical staff, and administrative personnel, with appointments made through advertised selection committees on an all-India basis with government-mandated reservation provisions. A Sexual Harassment Prevention Committee operates across all campuses, with designated Presiding Officers and members to address workplace concerns." +
          "\n\n" +
          "The RTI application fee is Rs. 10/-, waived for BPL applicants with proof.",
        items: [],
        links: [],
        contacts: [],
      },
      {
        // nid.edu's index of pages, mapped to this site's routes, in its order.
        // An unbuilt target is dropped by the gate and appears when its page is
        // built (Governing Council, Senate, Staff), with no edit here.
        id: "section-rti-on-this-website",
        page: PAGE_ID.regulatoryRti,
        order: 2,
        type: "links",
        title: "On this website",
        items: [
          page("history", "History", PAGE_ID.history),
          page("charter", "Charter", PAGE_ID.charter),
          page("curriculum-objectives", "Curriculum Objectives", PAGE_ID.curriculumObjectives),
          page("nid-act", "NID Act, Rules, Ordinances & Statutes", PAGE_ID.regulatoryNidAct),
          page("governing-council", "Governing Council", PAGE_ID.peopleGoverningCouncil),
          page("senate", "NID Senate", PAGE_ID.peopleSenate),
          page("admission", "Admission Process", PAGE_ID.studyAdmission),
          page("faculty", "Faculty", PAGE_ID.peopleFaculty),
          page("staff", "Staff", PAGE_ID.peopleStaff),
          page("annual-reports", "Annual Reports", PAGE_ID.regulatoryAnnualReports),
        ],
        links: [],
        contacts: [],
      },
      {
        id: "section-rti-key-documents",
        page: PAGE_ID.regulatoryRti,
        order: 3,
        type: "links",
        title: "Key Documents",
        // The CMS's sixteen, less its "Admissions FAQ"
        // (admissions.nid.edu/NIDA2025/download/FAQ.pdf), which 404s and which
        // LIVE drops: a fixture never carries a link known to be dead.
        // TODO(review): backend — that URL is now NIDA2027; the two nid.edu
        // links are http://, and both serve on https.
        items: [
          file("academic-allied-roles", "Academic & Allied Roles", "https://www.nid.edu/Userfiles/AcademicAlliedRoles.pdf"),
          file("select-committees", "Select Committees", "https://www.nid.edu/Userfiles/DetailsofSelectCommittees-ForRTIPage.pdf"),
          file("cvo", "CVO at NID Ahmedabad", "https://www.nid.edu/Userfiles/CVO_NIDAhmedabad_ForRTIPage.pdf"),
          file("liaison-officer", "Liaison Officer", "https://www.nid.edu/Userfiles/Liaison_Officer.pdf"),
          file("pay-structure", "Pay Structure", "https://www.nid.edu/Userfiles/PayStructure.pdf"),
          file("grant", "Statement Showing Actual Grant Released", "https://www.nid.edu/Userfiles/Grant_ForRTIPage.pdf"),
          file("user-charge", "User Charge", "http://nid.edu/Userfiles/usercharges.pdf"),
          file("service-rules-en", "Service Rules 2014 (English)", "https://www.nid.edu/Userfiles/ServiceRules-2014-English.pdf"),
          file("service-rules-hi", "Service Rules 2014 (Hindi)", "https://www.nid.edu/Userfiles/ServiceRules-2014-Hindi.pdf"),
          file("holidays", "List of Holidays", "https://www.nid.edu/Userfiles/ListofHolidays.pdf"),
          file(
            "audit-certificate",
            "Website — Third Party Audit Certificate",
            "http://nid.edu/Userfiles/Safe_to_Host_Certificate_NID_Web_Application2021.pdf",
          ),
          file("ids-faq", "Integrated Design Services FAQ", "https://www.nid.edu/public/documents/QVb0DRQVwG.pdf"),
          file("placements-faq", "Placements FAQ", "https://industryinterface.nid.edu/download/FAQPlacementCell.pdf"),
          file("audit-report", "3rd Party Audit Report", "https://www.nid.edu/Userfiles/3rdPartyAuditReport.pdf"),
          file(
            "audit-report-detailed",
            "3rd Party Audit Report — Detailed",
            "https://www.nid.edu/Userfiles/3rdPartyAuditReport_Detailed.pdf",
          ),
        ],
        links: [],
        contacts: [],
      },
    ],
    // The contacts the CMS names no one for: column 4 of About (the template's
    // rule).
    contacts: [
      { label: "Contact", value: "rti@nid.edu" },
      { label: "Contact", value: "+91 79 2662 9550" },
    ],
    seoTitle: "Right to Information | NID",
    seoDescription: "RTI Act disclosures and contact details for the National Institute of Design.",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.about, title: "About NID", path: "/about" },
      { id: PAGE_ID.regulatoryRti, title: "Right to Information", path: PATH },
    ],
    // The gate's and breadcrumb's parent; the band is "More in Regulatory" (§86).
    backNav: { label: "About NID", href: "/about" },
    subPageLinks: [],
    siblingBand: regulatoryBand(PATH),
  },
};
