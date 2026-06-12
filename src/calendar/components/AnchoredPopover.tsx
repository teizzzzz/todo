import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

interface AnchoredPopoverProps {
  /** Viewport rect of the element the popover is anchored to. */
  anchorRect: DOMRect;
  children: ReactNode;
  /** Non-interactive (hover) popovers must not steal the pointer. */
  interactive?: boolean;
}

const GAP = 8;
const MARGIN = 12;

/**
 * Fixed-position popover that prefers the side of the anchor with room,
 * clamped to the viewport. Used for event details and "+N more" lists.
 */
export function AnchoredPopover({ anchorRect, children, interactive = true }: AnchoredPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({ visibility: "hidden" });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();

    let left = anchorRect.right + GAP;
    if (left + width > window.innerWidth - MARGIN) left = anchorRect.left - GAP - width;
    if (left < MARGIN) left = Math.min(anchorRect.left, window.innerWidth - width - MARGIN);
    left = Math.max(left, MARGIN);

    let top = anchorRect.top;
    if (top + height > window.innerHeight - MARGIN) top = window.innerHeight - height - MARGIN;
    top = Math.max(top, MARGIN);

    setStyle({ left, top, visibility: "visible" });
  }, [anchorRect]);

  return (
    <div
      ref={ref}
      style={style}
      className={`fixed z-50 w-80 max-w-[calc(100vw-24px)] rounded-xl border border-gray-200 bg-white shadow-xl ${
        interactive ? "" : "pointer-events-none"
      }`}
    >
      {children}
    </div>
  );
}
