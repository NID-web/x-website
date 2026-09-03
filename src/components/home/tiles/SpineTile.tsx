import { Tile } from "@/components/home/Tile";
import type { HomeTile, Translate } from "@/lib/home-content";

type SpineTileData = Extract<HomeTile, { kind: "spine" }>;

// "Knowledge Management Centre" — a shelf of book spines above the heading.
// Export: KMC / Frame17, a flex row of `Book`s, then the heading, then the
// closing rule, 16px apart, the whole stack pinned to the bottom of the tile.
export function SpineTile({ tile, t }: { tile: SpineTileData; t: Translate }) {
  return (
    <Tile as="section" surface="page" padding={false}>
      {/* No gap between spines: each one carries its own left hairline, so a gap
          would double the gutter the rules are meant to be. */}
      <div className="flex flex-1 items-stretch overflow-hidden">
        {tile.spines.map((spine) => (
          // Two elements, like the export's Book: an upright padded column, and
          // the rotated label inside it. Keeping the padding OFF the rotated
          // element is deliberate — Tailwind v4's px-*/py-* are the LOGICAL
          // padding-inline/padding-block, and writing-mode swaps those axes, so
          // `px-2` on the vertical element pads its top and bottom instead of
          // its sides and the shelf collapses to half width.
          <span
            key={spine}
            // w-7 (28px) is the export's column pitch: a 12px text box plus its
            // 8px sides. Left intrinsic, the column would take the 15.5px LINE
            // box instead of the 12px font size and run ~32px, which pushes the
            // eleventh spine off the tile. Fixed width + items-center gets the
            // pitch right and centres the label in it.
            className="flex w-7 shrink-0 flex-col items-center border-l border-border-subtle pt-1"
          >
            <span
              // text-micro is 12/15.5/0.04em medium — the export's spine
              // exactly. Futura (font-primary), not the body face, and on the
              // same quaternary teal as the overline.
              //
              // Spines that outrun the shelf truncate rather than wrap: that is
              // the design ("The Vision of the Past,…" is clipped in the Figma
              // frame). min-h-0 lets the flex child shrink below its content so
              // the ellipsis can actually engage.
              className="min-h-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-primary text-micro text-text-quaternary [writing-mode:vertical-rl]"
            >
              {spine}
            </span>
          </span>
        ))}
      </div>
      <h3 className="mt-4 font-primary text-h3 text-text-primary">{t(tile.headingKey)}</h3>
      {/* Same 32px closing rule the media cards carry (export: Rule4). */}
      <span aria-hidden="true" className="mt-4 block h-8 border-b-2 border-border-subtle" />
    </Tile>
  );
}
