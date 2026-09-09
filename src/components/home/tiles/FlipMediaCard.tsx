"use client";

import { useId, useState } from "react";
import clsx from "clsx";
import { Tile } from "@/components/home/Tile";
import { Overline } from "@/components/home/parts";
import { TileImage } from "@/components/home/TileImage";
import { Cta } from "@/components/spine/Cta";
import { Icon } from "@/components/spine/Icon";
import { IconButton } from "@/components/spine/IconButton";
import { Link } from "@/i18n/navigation";
import type { MediaAsset } from "@/lib/content-model";

// The two-faced workshop card (Figma 257:12880, variants Default / Variant3 /
// Variant2). Three states, not two: the FRONT has a rest and a hover form, and
// the flip control turns it over to the BACK.
//
//   Default   rest      overline text/quaternary, title text/primary,
//                       closing rule border/subtle, no arrows
//   Variant3  hover     overline text/primary, title text/secondary, rule
//                       icon/tertiary, and an arrow row opens: the event link
//                       (arrow-up-right) left, the flip control right
//   Variant2  flipped   66px thumbnail beside title and date, the body copy,
//                       then "Event link" as a text CTA where the front drew an
//                       arrow — the same destination, named rather than implied
//
// This is the only home tile that ships JS. It is its own client component so
// that the other media cards stay server-rendered: `MediaCardTile` translates
// and hands plain strings over the boundary rather than a `t` function.
//
// The swap is INSTANT — no 3D transform. The design gives three variants and no
// motion between them, and inventing a flip here would be the one transform in
// a codebase whose state changes are colour-only (CLAUDE.md § Icons and motion).
// Only the arrow row's reveal is animated, and that follows PortraitTile: the
// slot opens from nothing under `motion-safe:`, so reduced motion still gets the
// arrows, instantly (STAGE-0-NOTES §48).

export interface FlipMediaCardProps {
  media?: MediaAsset;
  overline?: string;
  title: string;
  date?: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  ctaExternal?: boolean;
  /** Accessible names for the flip control in each direction. */
  showDetailsLabel: string;
  showCoverLabel: string;
}

export function FlipMediaCard({
  media,
  overline,
  title,
  date,
  body,
  ctaLabel,
  ctaHref,
  ctaExternal,
  showDetailsLabel,
  showCoverLabel,
}: FlipMediaCardProps) {
  const [flipped, setFlipped] = useState(false);
  const faceId = useId();

  const flipButton = (
    <IconButton
      icon="arrow-arc-left"
      // icon/primary, not IconButton's pale quaternary default: the export
      // fills this glyph with the value text/primary resolves to, and the
      // quaternary ramp is near-invisible on the page surface.
      tone="primary"
      label={flipped ? showCoverLabel : showDetailsLabel}
      onClick={() => setFlipped((v) => !v)}
      expanded={flipped}
      controls={faceId}
    />
  );

  if (flipped) {
    return (
      <Tile as="article" surface="page" padding={false}>
        <div id={faceId} className="flex h-full flex-col">
          <div className="flex w-full shrink-0 items-center gap-2 pr-4">
            {media && (
              <TileImage
                media={media}
                className="relative size-[66px] shrink-0"
                sizes="66px"
              />
            )}
            <div className="flex min-w-0 flex-1 flex-col justify-center pl-4 pr-4">
              <p className="font-primary text-h5 text-text-primary">{title}</p>
              {date && (
                <p className="font-primary text-micro text-text-primary">{date}</p>
              )}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2 py-6">
            <p className="min-h-0 flex-1 overflow-hidden px-6 font-primary text-label text-text-tertiary">
              {body}
            </p>
            <div className="flex w-full items-center justify-between">
              <Cta
                variant="uppercase"
                icon="none"
                label={ctaLabel}
                href={ctaHref}
                external={ctaExternal}
                // border/subtle darkening to border/default on the CTA's OWN
                // hover — the same rule RosterTile and ListTile draw, and both
                // are border tokens, so this is a rule rather than a decorative
                // accent. `min-h-8` is the export's 32px box.
                className="min-h-8 border-b-2 border-border-subtle px-2 py-1 hover:border-border-default"
              />
              {flipButton}
            </div>
          </div>
        </div>
      </Tile>
    );
  }

  return (
    <Tile as="article" surface="page" padding={false}>
      <div id={faceId} className="flex h-full w-full flex-col">
        {media && (
          <TileImage media={media} className="relative min-h-40 w-full flex-1" />
        )}
        <div className="flex flex-1 flex-col justify-between">
          {overline && (
            <div className="pt-2">
              <Overline shortRule hoverDark>
                {overline}
              </Overline>
            </div>
          )}

          <div className="flex w-full items-start gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h4 className="font-primary text-h5 text-text-primary transition-colors duration-150 ease-in-out group-hover/tile:text-text-secondary">
                {title}
              </h4>
              {date && (
                <p className="font-primary text-label text-text-tertiary">{date}</p>
              )}
            </div>
          </div>

          {/* The arrow row's slot opens from nothing rather than being reserved:
              the Default variant has no row at all, so reserving 32px would
              spend it at rest and leave nothing to open. `focus-within` as well
              as `hover`, because a keyboard reaches the flip control before any
              pointer does — and on a touch device there is no hover at all, so
              this is the only thing that makes the card turnable there. */}
          <div
            className={clsx(
              "h-0 overflow-hidden",
              "motion-safe:transition-[height] motion-safe:duration-400 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
              "group-hover/tile:h-8 group-focus-within/tile:h-8",
            )}
          >
            <div className="flex w-full items-center justify-between">
              <Link
                href={ctaHref}
                {...(ctaExternal ? { target: "_blank", rel: "noreferrer" } : {})}
                aria-label={ctaLabel}
                // icon/quaternary, as PortraitTile's arrow is and as the export
                // fills this glyph — NOT the darker icon/tertiary. The flip
                // control beside it is icon/primary, and the two being
                // different weights is the board's intent, not an oversight.
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full p-1 text-icon-quaternary no-underline transition-colors duration-150 ease-in-out hover:bg-accent-quaternary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
              >
                <Icon name="arrow-up-right" className="size-6" />
              </Link>
              {flipButton}
            </div>
          </div>

          <span
            aria-hidden="true"
            className="block h-2 border-b-2 border-border-subtle transition-colors duration-150 ease-in-out group-hover/tile:border-icon-tertiary"
          />
        </div>
      </div>
    </Tile>
  );
}
