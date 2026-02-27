"use client";

import { useState, useEffect } from "react";

/**
 * Generic hook that evaluates a CSS media query string.
 * Returns `false` during SSR for hydration safety.
 * Updates reactively when the media query match state changes.
 *
 * @param query - A valid CSS media query string, e.g. "(min-width: 768px)"
 * @returns Whether the media query currently matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);

    // Sync initial value on mount
    setMatches(mql.matches);

    // Listen for threshold crossings
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
