import { UserPlus, Plus, CalendarPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface RouteConfig {
  title: string;
  fab?: {
    icon: LucideIcon;
    label: string;
    action: string;
  };
}

export const ownerRouteConfig: Record<string, RouteConfig> = {
  "/owner/dashboard": {
    title: "Dashboard",
  },
  "/owner/clientes": {
    title: "Clientes",
    fab: { icon: UserPlus, label: "Agregar cliente", action: "add-client" },
  },
  "/owner/servicios": {
    title: "Servicios",
    fab: { icon: Plus, label: "Agregar servicio", action: "add-service" },
  },
  "/owner/empleados": {
    title: "Empleados",
    fab: { icon: UserPlus, label: "Agregar empleado", action: "add-employee" },
  },
  "/owner/agenda": {
    title: "Agenda",
    fab: {
      icon: CalendarPlus,
      label: "Nueva cita",
      action: "add-appointment",
    },
  },
  "/owner/recompensas": {
    title: "Recompensas",
    fab: { icon: Plus, label: "Agregar recompensa", action: "add-reward" },
  },
  "/owner/puntos": {
    title: "Escanear QR",
  },
  "/owner/canjes": {
    title: "Canjes",
  },
  "/owner/reportes": {
    title: "Reportes",
  },
  "/owner/configuracion": {
    title: "Configuración",
  },
};

export const clientRouteConfig: Record<string, RouteConfig> = {
  "/client/dashboard": {
    title: "Inicio",
  },
  "/client/recompensas": {
    title: "Recompensas",
  },
  "/client/reservas": {
    title: "Reservas",
  },
  "/client/historial": {
    title: "Historial",
  },
  "/client/perfil": {
    title: "Mi Perfil",
  },
};

export function getRouteTitle(
  pathname: string,
  role: "owner" | "client"
): string {
  const config = role === "owner" ? ownerRouteConfig : clientRouteConfig;

  // Exact match
  if (config[pathname]) {
    return config[pathname].title;
  }

  // Prefix match for sub-routes (e.g. /owner/clientes/123)
  const matchedKey = Object.keys(config)
    .filter((key) => pathname.startsWith(key + "/"))
    .sort((a, b) => b.length - a.length)[0];

  if (matchedKey) {
    return config[matchedKey].title;
  }

  // Fallback: capitalize last path segment
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];

  if (last) {
    return last.charAt(0).toUpperCase() + last.slice(1);
  }

  return "Loyalty";
}

export function getRouteConfig(
  pathname: string,
  role: "owner" | "client"
): RouteConfig | undefined {
  const config = role === "owner" ? ownerRouteConfig : clientRouteConfig;

  if (config[pathname]) {
    return config[pathname];
  }

  const matchedKey = Object.keys(config)
    .filter((key) => pathname.startsWith(key + "/"))
    .sort((a, b) => b.length - a.length)[0];

  return matchedKey ? config[matchedKey] : undefined;
}
