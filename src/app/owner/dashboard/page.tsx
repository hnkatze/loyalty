"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user?.name || "Dueño"}
          {establishment && (
            <span className="ml-1">- {establishment.name}</span>
          )}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.totalClients}
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {establishment?.currencyName || "Puntos"} Hoy
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : (
                <>
                  {establishment?.currencySymbol || "⭐"} {stats.pointsToday}
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Otorgados hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Canjeados Hoy
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : (
                <>
                  {establishment?.currencySymbol || "⭐"} {stats.redemptionsToday}
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Puntos canjeados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Citas Hoy
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.appointmentsToday}
            </div>
            <p className="text-xs text-muted-foreground">
              Citas programadas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
