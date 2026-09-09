import { TYPE_STYLES } from "./tokens";

const FUTURA_LADDER = [300, 400, 500, 600, 700, 800] as const;

// Type specimen demonstrating all typography styles via text-* utility classes.
export function TypeSpecimen() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        {TYPE_STYLES.map((style) => (
          <div
            key={style.label}
            className="flex flex-col gap-1 border-b border-border-faint pb-4"
          >
            <p className="font-body text-caption text-text-tertiary">
              {style.label} — expected desktop {style.desktop.size}/{style.desktop.lh}px ·
              tracking {style.desktop.tracking} · weight {style.desktop.weight}
            </p>
            <p className={style.className + " text-text-primary"}>
              National Institute of Design
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-body text-caption text-text-tertiary">
          Futura PT weight ladder — confirms Heavy reads 700 and Bold reads 800
        </p>
        {FUTURA_LADDER.map((w) => (
          <p
            key={w}
            className="font-primary text-h4 text-text-primary"
            style={{ fontWeight: w }}
          >
            {w} — National Institute of Design
          </p>
        ))}
      </div>
    </div>
  );
}
