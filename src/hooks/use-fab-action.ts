"use client";

import { useEffect } from "react";

export function useFabAction(action: string, callback: () => void) {
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.action === action) {
        callback();
      }
    };
    window.addEventListener("fab:action", handler);
    return () => window.removeEventListener("fab:action", handler);
  }, [action, callback]);
}
