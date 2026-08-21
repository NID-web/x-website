import { defineRouting } from "next-intl/routing";

// Adding Hindi is one entry here plus messages/hi.json — nothing else.
// (A Devanagari fallback also needs adding to the font stacks; neither
// Futura PT nor Tonos covers the script.)
export const routing = defineRouting({
  locales: ["en"],
  defaultLocale: "en",
});
