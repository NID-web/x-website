// The campus pages' presentation on the secondary template (SecondaryTemplate),
// by route: what their boards draw that the model has no field for.
import type { SecondaryLayout } from "@/components/sections/SecondaryTemplate";

// TODO(review): which bodies clamp, named here as on Charter, History and
// Campuses (STAGE-0-NOTES §52), counted in lines of TEXT per §55. Ahmedabad's
// and Gandhinagar's About boards draw a "See more" over a full text no longer
// than the visible one — eight lines both — so the control appears only when
// the CMS copy runs longer. Bengaluru's About shows its first paragraph, 7 of
// 13 lines (210px); Research Labs 6 of 9 (240px, two blank lines drawn).
// Measured against the board copy at 684px. Gandhinagar's Workshops body has
// no "See more" on the board and gets none.
//
// `imaged`: the sections each board draws a photograph for (4141:246838/39,
// 246905/06, 246952/53). None has an asset yet.
//
// Ahmedabad's Centre links run two-up across columns 2–3 (4132:246478).
export const CAMPUS_LAYOUT: Record<string, SecondaryLayout> = {
  "/about/campuses/ahmedabad": {
    clamp: { "section-ahmedabad-about": 8 },
    imaged: new Set(["section-ahmedabad-about", "section-ahmedabad-workshops"]),
    twoUpLinks: new Set(["section-ahmedabad-services"]),
    siblingTitle: "otherCampuses",
  },
  "/about/campuses/gandhinagar": {
    clamp: { "section-gandhinagar-about": 8 },
    imaged: new Set(["section-gandhinagar-about", "section-gandhinagar-workshops"]),
    siblingTitle: "otherCampuses",
  },
  "/about/campuses/bengaluru": {
    clamp: { "section-bengaluru-about": 7, "section-bengaluru-research": 6 },
    imaged: new Set(["section-bengaluru-about", "section-bengaluru-research"]),
    siblingTitle: "otherCampuses",
  },
};
