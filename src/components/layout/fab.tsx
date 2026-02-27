"use client";

import { usePathname } from "next/navigation";
import { ownerRouteConfig } from "@/lib/route-config";

export function Fab() {
  const pathname = usePathname();

  // Exact match first, then prefix match
  const config =
    ownerRouteConfig[pathname] ??
    (() => {
      const matchedKey = Object.keys(ownerRouteConfig)
        .filter((key) => pathname.startsWith(key + "/"))
        .sort((a, b) => b.length - a.length)[0];
      return matchedKey ? ownerRouteConfig[matchedKey] : undefined;
    })();

  if (!config?.fab) return null;

  const { icon: Icon, label, action } = config.fab;

  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent("fab:action", { detail: { action } })
    );
  };

  return (
    <button
      onClick={handleClick}
      aria-label={label}
      className="fixed bottom-6 right-4 z-40 size-14 rounded-full shadow-lg bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-transform duration-100 md:hidden"
    >
      <Icon className="size-6" />
    </button>
  );
}
