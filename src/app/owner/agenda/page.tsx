"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppointmentsCalendar, AppointmentFormDialog } from "@/components/owner/appointments";
import { getAppointmentsByEstablishment, createAppointment, updateAppointmentStatus } from "@/lib/firebase/firestore/appointments";
import { getActiveServices } from "@/lib/firebase/firestore/services";
import { getActiveEmployees } from "@/lib/firebase/firestore/employees";
import { getClientsByEstablishment } from "@/lib/firebase/firestore/clients";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Appointment, Service, Employee, Client, AppointmentStatus } from "@/types";

export default function AgendaPage() {
  const { user, establishment, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>("all");

  const establishmentId = establishment?.id;

  const loadAppointments = useCallback(async (date: Date) => {
    if (!establishmentId) return;

    try {
      // Obtener inicio y fin del mes para cargar todas las citas del mes visible
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const data = await getAppointmentsByEstablishment(
        establishmentId,
        startOfMonth,
        endOfMonth
      );
      setAppointments(data);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Error al cargar las citas");
    }
  }, [establishmentId]);

  const loadInitialData = useCallback(async () => {
    if (!establishmentId) return;

    setLoading(true);
    try {
      const [servicesData, employeesData, clientsData] = await Promise.all([
        getActiveServices(establishmentId),
        getActiveEmployees(establishmentId),
        getClientsByEstablishment(establishmentId),
      ]);

      setServices(servicesData);
      setEmployees(employeesData);
      setClients(clientsData);

      await loadAppointments(selectedDate);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }, [establishmentId, selectedDate, loadAppointments]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleDateChange = async (date: Date) => {
    setSelectedDate(date);
    await loadAppointments(date);
  };

  const handleCreateAppointment = async (data: {
    clientId: string;
    serviceId: string;
    employeeId: string;
    date: Date;
    duration: number;
    notes?: string;
  }) => {
    if (!establishmentId) return;

    try {
      await createAppointment({
        ...data,
        establishmentId,
      });

      toast.success("Cita creada exitosamente");
      setIsFormOpen(false);
      await loadAppointments(selectedDate);
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Error al crear la cita");
      throw error;
    }
  };

  const handleStatusChange = async (appointmentId: string, status: AppointmentStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, status);

      const statusMessages: Record<AppointmentStatus, string> = {
        pending: "Cita marcada como pendiente",
        confirmed: "Cita confirmada",
        completed: "Cita completada",
        cancelled: "Cita cancelada",
      };

      toast.success(statusMessages[status]);
      await loadAppointments(selectedDate);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gestiona las citas de tu establecimiento
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nueva cita
        </Button>
      </div>

      <AppointmentsCalendar
        appointments={appointments}
        employees={employees}
        services={services}
        clients={clients}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onStatusChange={handleStatusChange}
        onNewAppointment={() => setIsFormOpen(true)}
        selectedEmployeeFilter={selectedEmployeeFilter}
        onEmployeeFilterChange={setSelectedEmployeeFilter}
      />

      <AppointmentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        clients={clients}
        services={services}
        employees={employees}
        establishmentId={establishmentId || ""}
        selectedDate={selectedDate}
        onSubmit={handleCreateAppointment}
      />
    </div>
  );
}
