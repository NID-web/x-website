// A person: circular portrait, name beneath — the library's Person component
// (646:47958) as History's Faculty Stalwarts band instances it (NID-CONTEXT
// §7.7). Director's Message adds the component's overline: the role, over the
// accent gradient rule (§60). `profile` stays unrendered.
import { Overline } from "@/components/home/parts";
import { TileImage } from "@/components/home/TileImage";
import { Icon } from "@/components/spine/Icon";
import { Link } from "@/i18n/navigation";
import type { MediaAsset, Person } from "@/lib/content-model";
import { facultyMemberPath } from "@/lib/content/faculty-views";
import { builtHref } from "@/lib/content/links";

/** The circular portrait, 144px at every width (the board's size, 330 and 171
 *  wide alike). `mix-blend-luminosity` is the board's own treatment, which
 *  renders it in the theme's tint rather than full colour. Also a faculty
 *  member page's portrait above its key info (§83), never upscaled. */
export function Portrait({ photo, name, priority = false }: { photo: MediaAsset; name: string; priority?: boolean }) {
  return (
    <TileImage
      media={{ ...photo, alt: photo.alt || name }}
      className="relative size-36 shrink-0 rounded-full mix-blend-luminosity"
      sizes="144px"
      priority={priority}
    />
  );
}

export function PersonCard({
  person,
  overline = false,
  placeholder = true,
  priority = false,
  wrapOverline = false,
}: {
  person: Person;
  /** Draw `designation` as the overline above the name. Off on History's band,
   *  whose board has none. */
  overline?: boolean;
  /** With no photo: true keeps an empty circle so a band of people keeps its
   *  rhythm; false draws no image at all, for a single person, where an empty
   *  circle reads as a missing face. */
  placeholder?: boolean;
  /** Eager-load the portrait. Only where it sits above the fold — the
   *  Director's Message portrait is row 2 of the page; History's band is not. */
  priority?: boolean;
  /** Let a long role wrap: the CMS's role lines run to "Activity Chairperson,
   *  Research & Publications", which overflowed a 171px phone card by 192px. */
  wrapOverline?: boolean;
}) {
  // The person's page, when it built (a faculty member, §83). The gate
  // registered the built slugs before this renders: every caller's data
  // function awaits the faculty index.
  const href = builtHref(facultyMemberPath(person.slug));
  // Keyed only beside an email; alone it is the element it always was.
  const name = (key?: string) =>
    href ? (
      <h3 key={key} className="font-primary text-h6 text-text-secondary">
        {/* The NAME is the link, stretched over the card (MediaCardTile's
            reasoning): the accessible name is the person, the target the
            whole card. Colour-only hover. */}
        <Link
          href={href}
          className="no-underline transition-colors duration-150 ease-in-out after:absolute after:inset-0 after:content-[''] group-hover/person:text-text-primary"
        >
          {person.name}
        </Link>
        {/* The linked-tile arrow: a slot that opens by height on hover or
            focus, instantly under reduced motion (CLAUDE.md's one sanctioned
            exception; MediaCardTile is the reference). */}
        <span className="block h-0 overflow-hidden motion-safe:transition-[height] motion-safe:duration-400 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/person:h-7 group-focus-within/person:h-7">
          <Icon name="arrow-up-right" className="mt-1 size-6 text-icon-quaternary" />
        </span>
      </h3>
    ) : (
      <h3 key={key} className="font-primary text-h6 text-text-secondary">
        {person.name}
      </h3>
    );
  // Label/Micro under the name (the discipline board); only when the person
  // record carries one — no person shown before had an email.
  const email = person.email && (
    <a
      key="email"
      href={`mailto:${person.email}`}
      className={
        // Above the card's stretched link, so it stays its own target.
        href
          ? "relative z-10 font-primary text-micro text-text-secondary no-underline transition-colors duration-150 ease-in-out hover:text-text-primary"
          : "font-primary text-micro text-text-secondary no-underline transition-colors duration-150 ease-in-out hover:text-text-primary"
      }
    >
      {person.email}
    </a>
  );
  return (
    <article className={href ? "group/person relative flex flex-col gap-4 py-3" : "flex flex-col gap-4 py-3"}>
      {/* 144px on the board at every width (330 and 171 wide alike).
          `mix-blend-luminosity` is the board's own treatment of the portrait,
          which renders it in the theme's tint rather than full colour. The
          model's alt rule is the person's name (NID-CONTEXT §12). */}
      {person.photo ? (
        <Portrait photo={person.photo} name={person.name} priority={priority} />
      ) : (
        placeholder && (
          // No stand-in face and no borrowed photo: an empty accent/subtle circle
          // at the portrait's size, so the band keeps its rhythm.
          <span aria-hidden="true" className="block size-36 shrink-0 rounded-full bg-accent-subtle" />
        )
      )}
      {/* With no email, exactly the elements a person always rendered: an
          empty child slot would still reach the RSC payload. */}
      {overline && person.designation ? (
        <div className="flex flex-col gap-0.5">
          <div className="py-2">
            <Overline wrap={wrapOverline}>{person.designation}</Overline>
          </div>
          {email ? [name("name"), email] : name()}
        </div>
      ) : email ? (
        [name("name"), email]
      ) : (
        name()
      )}
    </article>
  );
}
