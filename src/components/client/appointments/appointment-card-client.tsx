"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Appointment, Service, Employee, AppointmentStatus } from "@/types";

interface AppointmentCardClientProps {
  appointment: Appointment;
  service: Service | null;
  employee: Employee | null;
  onCancel?: (appointmentId: string) => void;
  showCancelButton?: boolean;
}

const statusConfig: Record<
  AppointmentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Pendiente", variant: "secondary" },
  confirmed: { label: "Confirmada", variant: "default" },
  completed: { label: "Completada", variant: "outline" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

export function AppointmentCardClient({
  appointment,
  service,
  employee,
  onCancel,
  showCancelButton = false,
}: AppointmentCardClientProps) {
  const status = statusConfig[appointment.status];
  const isPast = appointment.date < new Date();
  const canCancel =
    showCancelButton &&
    !isPast &&
    (appointment.status === "pending" || appointment.status === "confirmed");

  return (
    <Card className={isPast ? "opacity-60" : ""}>
      <CardContent className="py-4">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={status.variant}>{status.label}</Badge>
              {isPast && (
                <span className="text-xs text-muted-foreground">(Pasada)</span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-primary" />
                {format(appointment.date, "EEEE, d 'de' MMMM", { locale: es })}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {format(appointment.date, "HH:mm")} hrs
                {service && (
                  <span className="text-muted-foreground">
                    ({service.duration} min)
                  </span>
                )}
              </div>

              {service && (
                <div className="text-sm text-muted-foreground">
                  {service.name}
                </div>
              )}

              {employee && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  con {employee.name}
                </div>
              )}

              {appointment.notes && (
                <p className="text-sm text-muted-foreground italic">
                  &quot;{appointment.notes}&quot;
                </p>
              )}
            </div>
          </div>

          {canCancel && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onCancel(appointment.id)}
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
