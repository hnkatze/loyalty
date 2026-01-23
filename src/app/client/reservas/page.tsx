"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getClientByUserId } from "@/lib/firebase/firestore/clients";
import { getActiveServices } from "@/lib/firebase/firestore/services";
import { getActiveEmployees } from "@/lib/firebase/firestore/employees";
import {
  getAppointmentsByClient,
  createAppointment,
  updateAppointmentStatus,
} from "@/lib/firebase/firestore/appointments";
import { BookingForm, MyAppointmentsList } from "@/components/client/appointments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { Client, Appointment, Service, Employee } from "@/types";

export default function ReservasPage() {
  const { user, establishment } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("nueva");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.id || !establishment?.id) return;

    setLoading(true);
    try {
      const [clientData, servicesData, employeesData] = await Promise.all([
        getClientByUserId(user.id),
        getActiveServices(establishment.id),
        getActiveEmployees(establishment.id),
      ]);

      setClient(clientData);
      setServices(servicesData);
      setEmployees(employeesData);

      if (clientData) {
        const appointmentsData = await getAppointmentsByClient(clientData.id);
        setAppointments(appointmentsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }, [user?.id, establishment?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateAppointment = async (data: {
    serviceId: string;
    employeeId: string;
    date: Date;
    duration: number;
    notes?: string;
  }) => {
    if (!client || !establishment) return;

    try {
      await createAppointment({
        ...data,
        clientId: client.id,
        establishmentId: establishment.id,
      });

      toast.success("Cita reservada exitosamente");
      setActiveTab("miscitas");

      // Recargar citas
      const appointmentsData = await getAppointmentsByClient(client.id);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Error al reservar la cita");
      throw error;
    }
  };

  const handleCancelClick = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel || !client) return;

    try {
      await updateAppointmentStatus(appointmentToCancel, "cancelled");
      toast.success("Cita cancelada");
      setCancelDialogOpen(false);
      setAppointmentToCancel(null);

      // Recargar citas
      const appointmentsData = await getAppointmentsByClient(client.id);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Error al cancelar la cita");
    }
  };

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
        <h1 className="text-3xl font-bold">Reservas</h1>
        <p className="text-muted-foreground">
          Agenda tu próxima visita o revisa tus citas
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nueva">Nueva Reserva</TabsTrigger>
          <TabsTrigger value="miscitas">
            Mis Citas ({appointments.filter(
              (a) => a.status === "pending" || a.status === "confirmed"
            ).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nueva" className="mt-4">
          <BookingForm
            services={services}
            establishmentId={establishment?.id || ""}
            establishmentHours={establishment?.hours}
            onSubmit={handleCreateAppointment}
          />
        </TabsContent>

        <TabsContent value="miscitas" className="mt-4">
          <MyAppointmentsList
            appointments={appointments}
            services={services}
            employees={employees}
            onCancelAppointment={handleCancelClick}
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar esta cita?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La cita será cancelada y el
              horario quedará disponible para otros clientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, cancelar cita
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
