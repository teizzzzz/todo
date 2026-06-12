import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** < 768px: agenda replaces week view, touch interactions take over. */
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");

/** >= 1024px: hover popovers enabled. */
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
