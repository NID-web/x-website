import { Tile } from "@/components/home/Tile";
import { Cta } from "@/components/spine/Cta";
import type { HomeTile, Translate } from "@/lib/home-content";

type FeatureTileData = Extract<HomeTile, { kind: "feature" }>;

// "Institute of National Importance" — a soft gradient disc with centred serif
// text. The gradient is built from decorative accent tokens (never hex); the
// serif reads in text/primary, which clears contrast on the pale field.
export function FeatureTile({ tile, t }: { tile: FeatureTileData; t: Translate }) {
  return (
    <Tile as="section" surface="page" padding={false}>
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-full bg-linear-to-br from-accent-tertiary/25 via-accent-quaternary/25 to-accent-pentenary/25 p-8 text-center">
        <h3 className="font-secondary text-display-serif text-text-primary">
          {t(tile.serifKey)}
        </h3>
        {tile.subKey && (
          <p className="max-w-56 font-body text-caption text-text-secondary">
            {t(tile.subKey)}
          </p>
        )}
        {tile.cta && (
          <Cta
            className="mt-1"
            label={t(tile.cta.labelKey)}
            href={tile.cta.href}
            external={tile.cta.external}
          />
        )}
      </div>
    </Tile>
  );
}
