// A discipline's route segment, in a module with no imports, so next.config.ts
// can derive the legacy redirects' targets by the same rule the pages use
// (STAGE-0-NOTES §105). getDiscipline.ts reads it from here.

/** The route segment: the CMS slug without its `-bdes` / `-mdes` suffix. */
export const disciplineBase = (slug: string, level: "bdes" | "mdes") => slug.replace(new RegExp(`-${level}$`), "");
