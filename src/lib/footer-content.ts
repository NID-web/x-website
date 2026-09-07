/**
 * Site footer — static content, shared by every page (design/tokens/sitemap.json
 * "footer"). Labels are `*Key` pointers into the "Footer" namespace of
 * messages/en.json; addresses, URLs and partner names are data.
 */
import type { MediaAsset } from "@/lib/content-model";
import { mediaAsset } from "@/lib/media";

/** A dotted key into the "Footer" message namespace. */
export type FooterKey = string;

export interface FooterLink {
  labelKey: FooterKey;
  href: string;
}

export type SocialPlatform = "x" | "facebook" | "instagram" | "youtube";
export interface SocialLink {
  platform: SocialPlatform;
  href: string;
}
export interface ContactLink {
  label: string; // the address itself — data
  href: string; // mailto: / tel:
}

export interface FooterContent {
  primaryLinks: FooterLink[];
  secondaryLinks: FooterLink[];
  contactOverlineKey: FooterKey;
  contacts: ContactLink[];
  social: SocialLink[];
  collaborationsOverlineKey: FooterKey;
  collaborations: Collaborator[];
}

/** A partner mark in the footer's collaborations card. The organisation name is
 *  a proper noun, so it is data rather than a message key, and it doubles as the
 *  logo's alt text. */
export interface Collaborator {
  name: string;
  /** `width`/`height` on the asset are the file's INTRINSIC size. */
  logo: MediaAsset;
  /** Rendered height in px, from the export's footer grid. The width follows
   *  each mark's own aspect — logos must never be stretched to a common box. */
  height: number;
}

export const FOOTER: FooterContent = {
  primaryLinks: [
    { labelKey: "careers", href: "/careers" },
    { labelKey: "ids", href: "/integrated-design-services" },
    { labelKey: "placements", href: "/placements" },
    { labelKey: "youngDesigners", href: "/young-designers" },
    { labelKey: "alumniReg", href: "/alumni/registration" },
    { labelKey: "tenders", href: "/tenders" },
    { labelKey: "pmVidyalaxmi", href: "/pm-vidyalaxmi" },
  ],
  secondaryLinks: [
    { labelKey: "rti", href: "/right-to-information" },
    { labelKey: "privacy", href: "/privacy-policy" },
    { labelKey: "terms", href: "/terms" },
    { labelKey: "sitemap", href: "/sitemap" },
  ],
  contactOverlineKey: "contact",
  contacts: [
    { label: "info@nid.edu", href: "mailto:info@nid.edu" },
    { label: "cmc@nid.edu", href: "mailto:cmc@nid.edu" },
    { label: "+91 79 2662 9500", href: "tel:+917926629500" },
    { label: "+91 79 2662 9600", href: "tel:+917926629600" },
  ],
  social: [
    { platform: "x", href: "https://x.com/nid_ahmedabad" },
    { platform: "facebook", href: "https://facebook.com/nid.ahmedabad" },
    { platform: "youtube", href: "https://youtube.com/@nid" },
    { platform: "instagram", href: "https://instagram.com/nid.ahmedabad" },
  ],
  collaborationsOverlineKey: "collaborations",
  // Six separate marks, in the export's grid order (FooterQuaternary). Skill
  // India and india.gov.in ship as vector data in the export and were rebuilt
  // as SVGs; the other four are its own raster exports.
  collaborations: [
    {
      name: "Skill India",
      logo: mediaAsset("/home/logos/skill-india.svg", "Skill India", 43, 36),
      height: 36,
    },
    {
      name: "india.gov.in",
      logo: mediaAsset("/home/logos/india-gov-in.svg", "india.gov.in", 51, 32),
      height: 32,
    },
    {
      name: "Make in India",
      logo: mediaAsset("/home/logos/make-in-india.png", "Make in India", 600, 274),
      height: 30,
    },
    {
      name: "Startup India",
      logo: mediaAsset("/home/logos/startup-india.png", "Startup India", 1080, 1080),
      height: 39,
    },
    {
      name: "Ministry of Women and Child Development, Government of India",
      logo: mediaAsset(
        "/home/logos/ministry-wcd.png",
        "Ministry of Women and Child Development, Government of India",
        1200,
        800,
      ),
      height: 45,
    },
    {
      name: "Khelo India",
      logo: mediaAsset("/home/logos/khelo-india.png", "Khelo India", 571, 350),
      height: 37,
    },
  ],
};
