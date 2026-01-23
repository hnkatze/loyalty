"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AppointmentCardClient } from "./appointment-card-client";
import type { Appointment, Service, Employee } from "@/types";

interface MyAppointmentsListProps {
  appointments: Appointment[];
  services: Service[];
  employees: Employee[];
  onCancelAppointment: (appointmentId: string) => void;
}

export function MyAppointmentsList({
  appointments,
  services,
  employees,
  onCancelAppointment,
}: MyAppointmentsListProps) {
  // Separar citas activas y pasadas basándose en el estado
  // Una cita es "próxima" si está pendiente o confirmada (independiente de la hora)
  const upcomingAppointments = appointments
    .filter((apt) => apt.status === "pending" || apt.status === "confirmed")
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Historial: citas completadas o canceladas
  const pastAppointments = appointments
    .filter((apt) => apt.status === "completed" || apt.status === "cancelled")
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const getService = (serviceId: string) =>
    services.find((s) => s.id === serviceId) || null;

  const getEmployee = (employeeId: string) =>
    employees.find((e) => e.id === employeeId) || null;

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No tienes citas programadas
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Próximas citas */}
      {upcomingAppointments.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Próximas citas</h3>
          {upcomingAppointments.map((appointment) => (
            <AppointmentCardClient
              key={appointment.id}
              appointment={appointment}
              service={getService(appointment.serviceId)}
              employee={getEmployee(appointment.employeeId)}
              onCancel={onCancelAppointment}
              showCancelButton
            />
          ))}
        </div>
      )}

      {/* Historial */}
      {pastAppointments.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-muted-foreground">
            Historial
          </h3>
          {pastAppointments.map((appointment) => (
            <AppointmentCardClient
              key={appointment.id}
              appointment={appointment}
              service={getService(appointment.serviceId)}
              employee={getEmployee(appointment.employeeId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
