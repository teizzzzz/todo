import { useRef } from "react";
import type { TouchEvent } from "react";

const SWIPE_THRESHOLD_PX = 56;
/** Reject mostly-vertical gestures so scrolling doesn't change the date. */
const MAX_VERTICAL_RATIO = 0.6;

export interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
}

/** Horizontal swipe detection for paging between dates on touch screens. */
export function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void): SwipeHandlers {
  const origin = useRef<{ x: number; y: number } | null>(null);

  return {
    onTouchStart: (e) => {
      const t = e.touches[0];
      origin.current = { x: t.clientX, y: t.clientY };
    },
    onTouchEnd: (e) => {
      if (!origin.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - origin.current.x;
      const dy = t.clientY - origin.current.y;
      origin.current = null;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
      if (Math.abs(dy) / Math.abs(dx) > MAX_VERTICAL_RATIO) return;
      if (dx < 0) onSwipeLeft();
      else onSwipeRight();
    },
  };
}
