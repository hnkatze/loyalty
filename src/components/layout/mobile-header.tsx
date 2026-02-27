"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ChevronLeft, LogOut, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { getRouteTitle } from "@/lib/route-config";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface MobileHeaderProps {
  navItems: NavItem[];
  userName?: string;
  userRole: "owner" | "client";
  onSignOut: () => void;
}

const ownerNavGroups: NavGroup[] = [
  {
    title: "Operaciones",
    items: [
      { href: "/owner/dashboard", label: "Dashboard", icon: undefined as unknown as LucideIcon },
      { href: "/owner/puntos", label: "Escanear QR", icon: undefined as unknown as LucideIcon },
      { href: "/owner/canjes", label: "Canjes", icon: undefined as unknown as LucideIcon },
    ],
  },
  {
    title: "Gestión",
    items: [
      { href: "/owner/clientes", label: "Clientes", icon: undefined as unknown as LucideIcon },
      { href: "/owner/servicios", label: "Servicios", icon: undefined as unknown as LucideIcon },
      { href: "/owner/empleados", label: "Empleados", icon: undefined as unknown as LucideIcon },
      { href: "/owner/agenda", label: "Agenda", icon: undefined as unknown as LucideIcon },
      { href: "/owner/recompensas", label: "Recompensas", icon: undefined as unknown as LucideIcon },
    ],
  },
  {
    title: "Administración",
    items: [
      { href: "/owner/reportes", label: "Reportes", icon: undefined as unknown as LucideIcon },
      { href: "/owner/configuracion", label: "Configuración", icon: undefined as unknown as LucideIcon },
    ],
  },
];

/**
 * Build grouped navigation by matching navItems (which carry the correct icons)
 * against the predefined group structure.
 */
function buildOwnerGroups(navItems: NavItem[]): NavGroup[] {
  const itemMap = new Map(navItems.map((item) => [item.href, item]));

  return ownerNavGroups.map((group) => ({
    title: group.title,
    items: group.items
      .map((stub) => itemMap.get(stub.href))
      .filter((item): item is NavItem => item !== undefined),
  }));
}

export function MobileHeader({
  navItems,
  userName,
  userRole,
  onSignOut,
}: MobileHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const roleLabel = userRole === "owner" ? "Dueño" : "Cliente";
  const pageTitle = getRouteTitle(pathname, userRole);
  const isOwner = userRole === "owner";
  const showBackButton = isOwner && pathname !== "/owner/dashboard";

  // Scroll-aware border with RAF throttle
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Client variant: simple header with centered title, no hamburger
  if (!isOwner) {
    return (
      <header
        className={cn(
          "sticky top-0 z-50 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden",
          "border-b transition-colors duration-200",
          scrolled ? "border-border" : "border-transparent"
        )}
      >
        <div className="flex h-full items-center justify-between px-4">
          {/* Spacer to balance the ThemeToggle on the right */}
          <div className="w-9" />

          <h1 className="text-lg font-semibold">{pageTitle}</h1>

          <ThemeToggle />
        </div>
      </header>
    );
  }

  // Owner variant: hamburger menu with grouped navigation
  const groups = buildOwnerGroups(navItems);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden",
        "border-b transition-colors duration-200",
        scrolled ? "border-border" : "border-transparent"
      )}
    >
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-1">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b p-4">
                <SheetTitle className="text-left">
                  <span className="text-xl font-bold">Loyalty</span>
                  <p className="text-sm font-normal text-muted-foreground truncate">
                    {userName || roleLabel}
                  </p>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex-1 overflow-y-auto p-2 pb-20">
                {groups.map((group) => (
                  <div key={group.title} className="mb-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                      {group.title}
                    </h3>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 rounded-md text-sm transition-colors min-h-[44px]",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    setOpen(false);
                    onSignOut();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Volver</span>
            </Button>
          )}
        </div>

        <h1 className="text-lg font-semibold">{pageTitle}</h1>

        <ThemeToggle />
      </div>
    </header>
  );
}
