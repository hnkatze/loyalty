"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { useAuth } from "@/hooks/use-auth";
import { Users, Gift, Calendar, TrendingUp } from "lucide-react";
import { getClientsByEstablishment } from "@/lib/firebase/firestore/clients";
import { getTodayStats } from "@/lib/firebase/firestore/transactions";

interface DashboardStats {
  totalClients: number;
  pointsToday: number;
  redemptionsToday: number;
  appointmentsToday: number;
}

export default function OwnerDashboardPage() {
  const { user, establishment } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    pointsToday: 0,
    redemptionsToday: 0,
    appointmentsToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!establishment?.id) return;

      try {
        // Cargar clientes
        const clients = await getClientsByEstablishment(establishment.id);

        // Cargar estadísticas del día
        const todayStats = await getTodayStats(establishment.id);

        setStats({
          totalClients: clients.length,
          pointsToday: todayStats.pointsEarned,
          redemptionsToday: todayStats.pointsRedeemed,
          appointmentsToday: 0, // TODO: implementar cuando tengamos appointments
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [establishment?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user?.name || "Dueño"}
          {establishment && (
            <span className="ml-1">- {establishment.name}</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Clientes"
          value={loading ? "..." : stats.totalClients}
          description="Clientes registrados"
          icon={Users}
          gradient="from-primary/5 to-transparent"
        />

        <StatCard
          title={`${establishment?.currencyName || "Puntos"} Hoy`}
          value={
            loading
              ? "..."
              : `${establishment?.currencySymbol || "⭐"} ${stats.pointsToday}`
          }
          description="Otorgados hoy"
          icon={TrendingUp}
          gradient="from-emerald-500/5 to-transparent"
        />

        <StatCard
          title="Canjeados Hoy"
          value={
            loading
              ? "..."
              : `${establishment?.currencySymbol || "⭐"} ${stats.redemptionsToday}`
          }
          description="Puntos canjeados"
          icon={Gift}
          gradient="from-amber-500/5 to-transparent"
        />

        <StatCard
          title="Citas Hoy"
          value={loading ? "..." : stats.appointmentsToday}
          description="Citas programadas"
          icon={Calendar}
          gradient="from-blue-500/5 to-transparent"
        />
      </div>

      <div className="grid gap-3 md:gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Proximas Citas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No hay citas programadas para hoy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No hay actividad reciente.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
