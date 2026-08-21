import { SPACING_STEPS } from "./tokens";

export function SpacingRadius() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        {SPACING_STEPS.map((step) => (
          <div key={step} className="flex items-center gap-3">
            <span className="w-16 font-body text-caption text-text-tertiary">{step}px</span>
            <div
              className="h-4 bg-accent-primary"
              style={{ width: `var(--nid-space-${step})` }}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-24 w-24 rounded-pill bg-accent-subtle" />
          <span className="font-body text-caption text-text-tertiary">
            radius-pill (24px)
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-24 w-24 rounded-none rounded-tl-hero bg-accent-subtle" />
          <span className="font-body text-caption text-text-tertiary">
            radius-hero (64px, top-left corner only)
          </span>
        </div>
      </div>
    </div>
  );
}
