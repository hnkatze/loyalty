"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { getClientByUserId } from "@/lib/firebase/firestore/clients";
import { getAppointmentsByClient } from "@/lib/firebase/firestore/appointments";
import { getService } from "@/lib/firebase/firestore/services";
import { getEmployee } from "@/lib/firebase/firestore/employees";
import Link from "next/link";
import { Gift, Calendar, QrCode, Clock, User } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatClientCode } from "@/lib/utils";
import type { Client, Appointment, Service, Employee } from "@/types";

export default function ClientDashboardPage() {
  const { user, establishment } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [appointmentService, setAppointmentService] = useState<Service | null>(null);
  const [appointmentEmployee, setAppointmentEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Obtener documento Client con balance
      const clientData = await getClientByUserId(user.id);
      setClient(clientData);

      if (clientData) {
        // Obtener citas del cliente
        const appointments = await getAppointmentsByClient(clientData.id);

        // Filtrar próximas citas (pendientes o confirmadas, futuras)
        const now = new Date();
        const upcomingAppointments = appointments
          .filter(
            (apt) =>
              (apt.status === "pending" || apt.status === "confirmed") &&
              apt.date > now
          )
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        if (upcomingAppointments.length > 0) {
          const next = upcomingAppointments[0];
          setNextAppointment(next);

          // Cargar detalles del servicio y empleado
          const [service, employee] = await Promise.all([
            getService(next.serviceId),
            getEmployee(next.employeeId),
          ]);
          setAppointmentService(service);
          setAppointmentEmployee(employee);
        }
      }
    } catch (error) {
      console.error("Error loading client data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currencySymbol = establishment?.currencySymbol || "⭐";
  const currencyName = establishment?.currencyName || "Puntos";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hola, {user?.name || "Cliente"}</h1>
        <p className="text-muted-foreground">
          {establishment?.name || "Tu programa de lealtad"}
        </p>
      </div>

      {/* Balance de puntos con mini QR y código */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm opacity-90">Tu balance actual</p>
              <div className="text-5xl font-bold">
                {client?.balance || 0} {currencySymbol}
              </div>
              <p className="text-sm opacity-90">{currencyName} disponibles</p>
            </div>
            {client && (
              <div className="flex flex-col items-center gap-1">
                <div className="bg-white p-2 rounded-lg">
                  <QRCodeSVG value={client.id} size={80} />
                </div>
                <span className="text-xs font-mono font-bold opacity-90">
                  {formatClientCode(client.code)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Próxima cita */}
      {nextAppointment ? (
        <Card className="border-primary/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Próxima Cita</CardTitle>
              <Badge
                variant={
                  nextAppointment.status === "confirmed"
                    ? "default"
                    : "secondary"
                }
              >
                {nextAppointment.status === "confirmed"
                  ? "Confirmada"
                  : "Pendiente"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-lg font-medium">
                <Calendar className="h-5 w-5 text-primary" />
                {format(nextAppointment.date, "EEEE, d 'de' MMMM", {
                  locale: es,
                })}
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                {format(nextAppointment.date, "HH:mm")} hrs
                {appointmentService && (
                  <span className="text-muted-foreground">
                    ({appointmentService.duration} min)
                  </span>
                )}
              </div>
              {appointmentService && (
                <div className="text-muted-foreground">
                  {appointmentService.name}
                </div>
              )}
              {appointmentEmployee && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  con {appointmentEmployee.name}
                </div>
              )}
            </div>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href="/client/reservas">Ver mis citas</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Próxima Cita</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No tienes citas programadas.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/client/reservas">Reservar ahora</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Acciones rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/client/recompensas">
            <CardHeader className="text-center">
              <Gift className="h-8 w-8 mx-auto text-primary" />
              <CardTitle className="text-lg">Ver Recompensas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Canjea tus puntos por premios
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/client/reservas">
            <CardHeader className="text-center">
              <Calendar className="h-8 w-8 mx-auto text-primary" />
              <CardTitle className="text-lg">Reservar Cita</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Agenda tu próxima visita
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/client/perfil">
            <CardHeader className="text-center">
              <QrCode className="h-8 w-8 mx-auto text-primary" />
              <CardTitle className="text-lg">Mi QR</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Muestra tu código para ganar puntos
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
