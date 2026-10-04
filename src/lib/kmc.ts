// The Knowledge Management Centre is a separate project, built and owned
// outside this site (4 Oct 2026): every KMC link opens its nid.edu page, and
// /kmc/* redirects there (next.config.ts). Never build a /kmc route.
//
// Only the landing and e-Resources are pages on nid.edu; other guessed paths
// 404. The database and the guidelines are real ids on the landing. "Design
// Classics Collection" and "Services" are paragraphs with no id, so they are
// the landing itself (STAGE-0-NOTES §85).
const LANDING = "https://www.nid.edu/academics/kmc";

export const KMC = {
  landing: LANDING,
  database: `${LANDING}#kmc_database`,
  guidelines: `${LANDING}#guidelines`,
  eResources: `${LANDING}/e-resources`,
} as const;
