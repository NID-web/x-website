// A campus's display name by its page id, from the campus pages' own fixtures —
// the one place the site names a campus ("Ahmedabad", not the CMS's
// "Ahmedabad Campus"). A card's meta line reads it; nothing types the name.
import type { UUID } from "@/lib/content-model";
import { CAMPUS_AHMEDABAD } from "@/lib/content/fixtures/campus-ahmedabad";
import { CAMPUS_BENGALURU } from "@/lib/content/fixtures/campus-bengaluru";
import { CAMPUS_GANDHINAGAR } from "@/lib/content/fixtures/campus-gandhinagar";

const NAME: Record<UUID, string> = Object.fromEntries(
  [CAMPUS_AHMEDABAD, CAMPUS_GANDHINAGAR, CAMPUS_BENGALURU].map((c) => [c.page.id, c.page.title]),
);

export function campusName(id: UUID): string | undefined {
  return NAME[id];
}
