"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimeSlotPicker } from "./time-slot-picker";
import { getAvailableSlots } from "@/lib/firebase/firestore/appointments";
import { getEmployeesByService } from "@/lib/firebase/firestore/employees";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Client, Service, Employee } from "@/types";

interface AppointmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  services: Service[];
  employees: Employee[];
  establishmentId: string;
  selectedDate?: Date;
  onSubmit: (data: {
    clientId: string;
    serviceId: string;
    employeeId: string;
    date: Date;
    duration: number;
    notes: string;
  }) => Promise<void>;
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  clients,
  services,
  employees,
  establishmentId,
  selectedDate,
  onSubmit,
}: AppointmentFormDialogProps) {
  const [clientId, setClientId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [clientSearch, setClientSearch] = useState("");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setClientId("");
      setServiceId("");
      setEmployeeId("");
      setDate(selectedDate || new Date());
      setSelectedSlot(null);
      setNotes("");
      setFilteredEmployees([]);
      setAvailableSlots([]);
      setClientSearch("");
    }
  }, [open, selectedDate]);

  // Filtrar empleados cuando cambia el servicio
  useEffect(() => {
    const loadEmployees = async () => {
      if (!serviceId || !establishmentId) {
        setFilteredEmployees([]);
        return;
      }

      try {
        const emps = await getEmployeesByService(establishmentId, serviceId);
        setFilteredEmployees(emps);
        setEmployeeId("");
        setAvailableSlots([]);
        setSelectedSlot(null);
      } catch (error) {
        console.error("Error loading employees:", error);
      }
    };

    loadEmployees();
  }, [serviceId, establishmentId]);

  // Cargar slots disponibles cuando cambia empleado, servicio o fecha
  useEffect(() => {
    const loadSlots = async () => {
      if (!employeeId || !serviceId || !date) {
        setAvailableSlots([]);
        return;
      }

      const employee = employees.find((e) => e.id === employeeId);
      const service = services.find((s) => s.id === serviceId);

      if (!employee || !service) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const slots = await getAvailableSlots(
          employeeId,
          employee.availability,
          service.duration,
          date
        );
        setAvailableSlots(slots);
        setSelectedSlot(null);
      } catch (error) {
        console.error("Error loading slots:", error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [employeeId, serviceId, date, employees, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId || !serviceId || !employeeId || !date || !selectedSlot) return;

    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    // Crear fecha con hora seleccionada
    const [hour, min] = selectedSlot.split(":").map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hour, min, 0, 0);

    setIsSubmitting(true);
    try {
      await onSubmit({
        clientId,
        serviceId,
        employeeId,
        date: appointmentDate,
        duration: service.duration,
        notes,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar clientes por búsqueda
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone.includes(clientSearch)
  );

  const selectedService = services.find((s) => s.id === serviceId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva cita</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente */}
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Input
              placeholder="Buscar cliente..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="mb-2"
            />
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {filteredClients.slice(0, 10).map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} - {client.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Servicio */}
          <div className="space-y-2">
            <Label>Servicio</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.filter((s) => s.isActive).map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} ({service.duration} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Empleado (filtrado por servicio) */}
          <div className="space-y-2">
            <Label>Empleado</Label>
            <Select
              value={employeeId}
              onValueChange={setEmployeeId}
              disabled={!serviceId || filteredEmployees.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !serviceId
                      ? "Primero selecciona un servicio"
                      : filteredEmployees.length === 0
                        ? "No hay empleados para este servicio"
                        : "Selecciona un empleado"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {filteredEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: es }) : "Selecciona una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Horarios disponibles */}
          {employeeId && date && (
            <TimeSlotPicker
              slots={availableSlots}
              selectedSlot={selectedSlot}
              onSelect={setSelectedSlot}
              loading={loadingSlots}
            />
          )}

          {/* Info del servicio seleccionado */}
          {selectedService && selectedSlot && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p>
                <strong>Servicio:</strong> {selectedService.name}
              </p>
              <p>
                <strong>Duración:</strong> {selectedService.duration} minutos
              </p>
              <p>
                <strong>Horario:</strong> {selectedSlot} - {(() => {
                  const [h, m] = selectedSlot.split(":").map(Number);
                  const endMinutes = h * 60 + m + selectedService.duration;
                  const endH = Math.floor(endMinutes / 60);
                  const endM = endMinutes % 60;
                  return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
                })()}
              </p>
            </div>
          )}

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                !clientId ||
                !serviceId ||
                !employeeId ||
                !date ||
                !selectedSlot ||
                isSubmitting
              }
            >
              {isSubmitting ? "Guardando..." : "Crear cita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
