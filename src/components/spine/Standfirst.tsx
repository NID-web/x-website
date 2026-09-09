"use client";

import clsx from "clsx";
import { useState } from "react";
import { Icon } from "@/components/spine/Icon";

/**
 * Standfirst introductory paragraph with mobile expandable clamp.
 */
export function Standfirst({ text, seeMore }: { text: string; seeMore: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <p
        className={clsx(
          "font-body text-body-lg text-text-secondary max-tablet:text-body-lg-bold max-tablet:text-text-primary",
          !open && "max-tablet:line-clamp-[7]",
        )}
      >
        {text}
      </p>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex items-center gap-2 py-2 font-primary text-body font-medium text-text-secondary transition-colors duration-150 ease-in-out hover:text-text-primary tablet:hidden"
        >
          <Icon name="plus" className="size-4 shrink-0 text-icon-quaternary" />
          {seeMore}
        </button>
      )}
    </>
  );
}
