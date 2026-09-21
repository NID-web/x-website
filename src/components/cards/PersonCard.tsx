// A person in a `rail` section: circular portrait, name beneath — the library's
// Person component (646:47958) as History's Faculty Stalwarts band instances it
// (NID-CONTEXT §7.7). No overline, designation or bio on that board, so
// `designation` and `profile` stay unrendered.
import { TileImage } from "@/components/home/TileImage";
import type { Person } from "@/lib/content-model";

export function PersonCard({ person }: { person: Person }) {
  return (
    <article className="flex flex-col gap-4 py-3">
      {/* 144px on the board at every width (330 and 171 wide alike).
          `mix-blend-luminosity` is the board's own treatment of the portrait,
          which renders it in the theme's tint rather than full colour. The
          model's alt rule is the person's name (NID-CONTEXT §12). */}
      {person.photo ? (
        <TileImage
          media={{ ...person.photo, alt: person.photo.alt || person.name }}
          className="relative size-36 shrink-0 rounded-full mix-blend-luminosity"
          sizes="144px"
        />
      ) : (
        // No stand-in face and no borrowed photo: an empty accent/subtle circle
        // at the portrait's size, so the band keeps its rhythm.
        <span aria-hidden="true" className="block size-36 shrink-0 rounded-full bg-accent-subtle" />
      )}
      <h3 className="font-primary text-h6 text-text-secondary">{person.name}</h3>
    </article>
  );
}
