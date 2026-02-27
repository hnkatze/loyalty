"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Gift,
  Calendar,
  History,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TabItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const clientTabs: TabItem[] = [
  { href: "/client/dashboard", label: "Inicio", icon: Home },
  { href: "/client/recompensas", label: "Recompensas", icon: Gift },
  { href: "/client/reservas", label: "Reservas", icon: Calendar },
  { href: "/client/historial", label: "Historial", icon: History },
  { href: "/client/perfil", label: "Mi Perfil", icon: User },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      role="tablist"
      className="fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t pb-[env(safe-area-inset-bottom,0.5rem)] md:hidden"
    >
      <div className="flex items-center justify-around">
        {clientTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[48px] text-[10px] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
