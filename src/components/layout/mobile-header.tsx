"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, type LucideIcon } from "lucide-react";
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

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface MobileHeaderProps {
  navItems: NavItem[];
  userName?: string;
  userRole: "owner" | "client";
  onSignOut: () => void;
}

export function MobileHeader({
  navItems,
  userName,
  userRole,
  onSignOut,
}: MobileHeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const roleLabel = userRole === "owner" ? "Dueño" : "Cliente";

  return (
    <header className="sticky top-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-full items-center justify-between px-4">
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
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
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

        <h1 className="text-lg font-bold">Loyalty</h1>

        <ThemeToggle />
      </div>
    </header>
  );
}
