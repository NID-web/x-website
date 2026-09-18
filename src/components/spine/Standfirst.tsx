import { ClampedProse } from "@/components/spine/ClampedProse";

/**
 * Standfirst introductory paragraph with mobile expandable clamp.
 */
export function Standfirst({ text, seeMore }: { text: string; seeMore: string }) {
  return (
    <ClampedProse
      text={text}
      clamp="phone-7"
      seeMore={seeMore}
      // One-way, as shipped: the 390 board (4361:190044) draws "See more" and
      // no way back, and the control is phone-only anyway.
      reCollapse={false}
      className="font-body text-body-lg text-text-secondary max-tablet:text-body-lg-bold max-tablet:text-text-primary"
    />
  );
}
