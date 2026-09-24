// A person: circular portrait, name beneath — the library's Person component
// (646:47958) as History's Faculty Stalwarts band instances it (NID-CONTEXT
// §7.7). Director's Message adds the component's overline: the role, over the
// accent gradient rule (§60). `profile` stays unrendered.
import { Overline } from "@/components/home/parts";
import { TileImage } from "@/components/home/TileImage";
import type { Person } from "@/lib/content-model";

export function PersonCard({
  person,
  overline = false,
  placeholder = true,
}: {
  person: Person;
  /** Draw `designation` as the overline above the name. Off on History's band,
   *  whose board has none. */
  overline?: boolean;
  /** With no photo: true keeps an empty circle so a band of people keeps its
   *  rhythm; false draws no image at all, for a single person, where an empty
   *  circle reads as a missing face. */
  placeholder?: boolean;
}) {
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
        placeholder && (
          // No stand-in face and no borrowed photo: an empty accent/subtle circle
          // at the portrait's size, so the band keeps its rhythm.
          <span aria-hidden="true" className="block size-36 shrink-0 rounded-full bg-accent-subtle" />
        )
      )}
      {overline && person.designation ? (
        <div className="flex flex-col gap-0.5">
          <div className="py-2">
            <Overline>{person.designation}</Overline>
          </div>
          <h3 className="font-primary text-h6 text-text-secondary">{person.name}</h3>
        </div>
      ) : (
        <h3 className="font-primary text-h6 text-text-secondary">{person.name}</h3>
      )}
    </article>
  );
}
