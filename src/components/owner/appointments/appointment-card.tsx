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
      <CardContent className="p-2.5 sm:p-4">
        {/* Mobile: Layout vertical compacto */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <Badge variant={statusConfig.variant} className="text-[10px] shrink-0">
                {statusConfig.label}
              </Badge>
              <span className="text-xs font-semibold text-primary">
                {formatTime(appointment.date)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                ({appointment.duration}min)
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-3.5 w-3.5" />
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

          <div className="flex items-center gap-2">
            {client ? (
              <>
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className="text-[10px]">{getInitials(client.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs truncate">{client.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {service?.name}
                    {employee && ` • ${employee.name}`}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span className="text-xs">Cliente no encontrado</span>
              </div>
            )}
          </div>

          {appointment.notes && (
            <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-1 pl-8">
              {appointment.notes}
            </p>
          )}
        </div>

        {/* Desktop: Layout horizontal */}
        <div className="hidden sm:flex items-start gap-3">
          <div className="text-center min-w-15 shrink-0">
            <p className="text-lg font-bold">{formatTime(appointment.date)}</p>
            <p className="text-xs text-muted-foreground">
              {appointment.duration} min
            </p>
          </div>

          <div className="border-l pl-3 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {client && (
                  <>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs">{getInitials(client.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-base truncate">{client.name}</p>
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

              <div className="flex items-center gap-1 shrink-0">
                <Badge variant={statusConfig.variant} className="text-xs">{statusConfig.label}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm">
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
      </CardContent>
    </Card>
  );
}
