import clsx from "clsx";
import { Tile } from "@/components/home/Tile";
import { Cta } from "@/components/spine/Cta";
import type { HomeTile, Translate } from "@/lib/home-content";

type FeatureTileData = Extract<HomeTile, { kind: "feature" }>;

function SerifLockup({ text }: { text: string }) {
  return (
    <h3 className="font-secondary text-display-serif text-text-primary">
      {text.split(/\s+/).map((word, i) => (
        <span
          key={`${i}-${word}`}
          className={clsx(
            "block",
            word === word.toLowerCase() && "italic text-text-tertiary",
          )}
        >
          {word}
        </span>
      ))}
    </h3>
  );
}

export function FeatureTile({ tile, t }: { tile: FeatureTileData; t: Translate }) {
  return (
    <Tile as="section" surface="page" padding={false}>
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-full bg-feature-disc p-4 text-center">
        <SerifLockup text={t(tile.serifKey)} />
        {tile.subKey && (
          <p className="text-balance font-primary text-label text-text-tertiary">
            {t(tile.subKey)}
          </p>
        )}
        {tile.cta && (
          <Cta
            className="min-h-8 border-b-2 border-surface-page px-2 py-1"
            label={t(tile.cta.labelKey)}
            href={tile.cta.href}
            external={tile.cta.external}
          />
        )}
      </div>
    </Tile>
  );
}
