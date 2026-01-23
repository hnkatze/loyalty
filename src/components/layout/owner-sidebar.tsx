"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Users,
  Scissors,
  UserCog,
  Calendar,
  Gift,
  QrCode,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

export const ownerNavItems = [
  { href: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner/clientes", label: "Clientes", icon: Users },
  { href: "/owner/servicios", label: "Servicios", icon: Scissors },
  { href: "/owner/empleados", label: "Empleados", icon: UserCog },
  { href: "/owner/agenda", label: "Agenda", icon: Calendar },
  { href: "/owner/recompensas", label: "Recompensas", icon: Gift },
  { href: "/owner/puntos", label: "Escanear QR", icon: QrCode },
  { href: "/owner/canjes", label: "Canjes", icon: Ticket },
  { href: "/owner/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/owner/configuracion", label: "Configuración", icon: Settings },
];

export function OwnerSidebar() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  return (
    <aside className="hidden md:flex w-64 border-r bg-card h-screen flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Loyalty</h1>
        <p className="text-sm text-muted-foreground truncate">
          {user?.name || "Dueño"}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {ownerNavItems.map((item) => {
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
