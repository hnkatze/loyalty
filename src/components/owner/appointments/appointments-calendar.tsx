"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppointmentCard } from "./appointment-card";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Appointment, AppointmentStatus, Client, Service, Employee } from "@/types";

interface AppointmentsCalendarProps {
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  employees: Employee[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onStatusChange: (appointmentId: string, status: AppointmentStatus) => void;
  onNewAppointment: () => void;
  selectedEmployeeFilter: string;
  onEmployeeFilterChange: (employeeId: string) => void;
}

export function AppointmentsCalendar({
  appointments,
  clients,
  services,
  employees,
  selectedDate,
  onDateChange,
  onStatusChange,
  onNewAppointment,
  selectedEmployeeFilter,
  onEmployeeFilterChange,
}: AppointmentsCalendarProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  // Filtrar citas por fecha seleccionada
  const appointmentsForDay = appointments.filter((a) => {
    const aptDate = a.date;
    return (
      aptDate.getFullYear() === selectedDate.getFullYear() &&
      aptDate.getMonth() === selectedDate.getMonth() &&
      aptDate.getDate() === selectedDate.getDate()
    );
  });

  // Filtrar por empleado si hay filtro
  const filteredAppointments =
    selectedEmployeeFilter === "all"
      ? appointmentsForDay
      : appointmentsForDay.filter((a) => a.employeeId === selectedEmployeeFilter);

  // Ordenar citas por hora
  const sortedAppointments = [...filteredAppointments].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  const getClient = (clientId: string) => clients.find((c) => c.id === clientId);
  const getService = (serviceId: string) => services.find((s) => s.id === serviceId);
  const getEmployee = (employeeId: string) => employees.find((e) => e.id === employeeId);

  const isToday =
    selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="space-y-4">
      {/* Header con navegación y filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setCalendarOpen(!calendarOpen)}
                  className="min-w-[200px]"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "EEEE, d MMMM", { locale: es })}
                </Button>

                {calendarOpen && (
                  <div className="absolute top-full left-0 mt-2 z-50 bg-popover border rounded-md shadow-lg">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          onDateChange(date);
                          setCalendarOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </div>
                )}
              </div>

              <Button variant="outline" size="icon" onClick={goToNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>

              {!isToday && (
                <Button variant="ghost" size="sm" onClick={goToToday}>
                  Hoy
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select
                value={selectedEmployeeFilter}
                onValueChange={onEmployeeFilterChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por empleado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los empleados</SelectItem>
                  {employees.filter((e) => e.isActive).map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={onNewAppointment}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva cita
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de citas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Citas del día ({sortedAppointments.length})
            </span>
            {isToday && (
              <span className="text-sm font-normal text-muted-foreground">
                Hoy
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedAppointments.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No hay citas programadas para este día
              </p>
              <Button variant="outline" className="mt-4" onClick={onNewAppointment}>
                <Plus className="mr-2 h-4 w-4" />
                Programar una cita
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  client={getClient(appointment.clientId)}
                  service={getService(appointment.serviceId)}
                  employee={getEmployee(appointment.employeeId)}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
