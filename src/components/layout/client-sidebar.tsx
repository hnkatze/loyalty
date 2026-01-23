"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Gift,
  Calendar,
  History,
  User,
  LogOut,
} from "lucide-react";

export const clientNavItems = [
  { href: "/client/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/client/recompensas", label: "Recompensas", icon: Gift },
  { href: "/client/reservas", label: "Reservas", icon: Calendar },
  { href: "/client/historial", label: "Historial", icon: History },
  { href: "/client/perfil", label: "Mi Perfil", icon: User },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  return (
    <aside className="hidden md:flex w-64 border-r bg-card h-screen flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Loyalty</h1>
        <p className="text-sm text-muted-foreground truncate">
          {user?.name || "Cliente"}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {clientNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
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

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
