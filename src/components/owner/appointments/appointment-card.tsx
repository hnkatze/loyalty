"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Check, X, Clock, User } from "lucide-react";
import type { Appointment, AppointmentStatus, Client, Service, Employee } from "@/types";

interface AppointmentCardProps {
  appointment: Appointment;
  client?: Client;
  service?: Service;
  employee?: Employee;
  onStatusChange: (appointmentId: string, status: AppointmentStatus) => void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
}

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Pendiente", variant: "outline" },
  confirmed: { label: "Confirmada", variant: "default" },
  completed: { label: "Completada", variant: "secondary" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

export function AppointmentCard({
  appointment,
  client,
  service,
  employee,
  onStatusChange,
  onEdit,
  onDelete,
}: AppointmentCardProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const statusConfig = STATUS_CONFIG[appointment.status];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-center min-w-[60px]">
              <p className="text-lg font-bold">{formatTime(appointment.date)}</p>
              <p className="text-xs text-muted-foreground">
                {appointment.duration} min
              </p>
            </div>

            <div className="border-l pl-3 flex-1">
              <div className="flex items-center gap-2">
                {client && (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.phone}</p>
                    </div>
                  </>
                )}
                {!client && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Cliente no encontrado</span>
                  </div>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                {service && (
                  <span className="text-muted-foreground">{service.name}</span>
                )}
                {employee && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">con {employee.name}</span>
                  </>
                )}
              </div>

              {appointment.notes && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {appointment.notes}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {appointment.status === "pending" && (
                  <DropdownMenuItem
                    onClick={() => onStatusChange(appointment.id, "confirmed")}
                  >
                    <Check className="mr-2 h-4 w-4 text-blue-500" />
                    Confirmar
                  </DropdownMenuItem>
                )}
                {(appointment.status === "pending" ||
                  appointment.status === "confirmed") && (
                  <DropdownMenuItem
                    onClick={() => onStatusChange(appointment.id, "completed")}
                  >
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Completar
                  </DropdownMenuItem>
                )}
                {appointment.status !== "cancelled" &&
                  appointment.status !== "completed" && (
                    <DropdownMenuItem
                      onClick={() => onStatusChange(appointment.id, "cancelled")}
                      className="text-destructive"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </DropdownMenuItem>
                  )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(appointment)}>
                    <Clock className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
