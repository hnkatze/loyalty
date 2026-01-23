"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeSlotPicker } from "@/components/owner/appointments";
import { getEmployeesByService } from "@/lib/firebase/firestore/employees";
import { getAvailableSlots } from "@/lib/firebase/firestore/appointments";
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Service, Employee, BusinessHours } from "@/types";

interface BookingFormProps {
  services: Service[];
  establishmentId: string;
  establishmentHours?: BusinessHours;
  onSubmit: (data: {
    serviceId: string;
    employeeId: string;
    date: Date;
    duration: number;
    notes?: string;
  }) => Promise<void>;
}

type Step = "service" | "employee" | "datetime" | "confirm";

export function BookingForm({
  services,
  establishmentId,
  establishmentHours,
  onSubmit,
}: BookingFormProps) {
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar empleados cuando se selecciona servicio
  useEffect(() => {
    const loadEmployees = async () => {
      if (!selectedService) return;

      setLoadingEmployees(true);
      try {
        const employees = await getEmployeesByService(
          establishmentId,
          selectedService.id
        );
        setAvailableEmployees(employees);
      } catch (error) {
        console.error("Error loading employees:", error);
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, [selectedService, establishmentId]);

  // Cargar slots disponibles cuando se selecciona fecha y empleado
  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedEmployee || !selectedService || !selectedDate) return;

      setLoadingSlots(true);
      setSelectedTime("");
      try {
        const slots = await getAvailableSlots(
          selectedEmployee.id,
          selectedEmployee.availability,
          selectedService.duration,
          selectedDate,
          establishmentHours
        );
        setAvailableSlots(slots);
      } catch (error) {
        console.error("Error loading slots:", error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedEmployee, selectedService, selectedDate, establishmentHours]);

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    setSelectedService(service || null);
    setSelectedEmployee(null);
    setSelectedTime("");
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = availableEmployees.find((e) => e.id === employeeId);
    setSelectedEmployee(employee || null);
    setSelectedTime("");
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedEmployee || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      await onSubmit({
        serviceId: selectedService.id,
        employeeId: selectedEmployee.id,
        date: appointmentDate,
        duration: selectedService.duration,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setStep("service");
      setSelectedService(null);
      setSelectedEmployee(null);
      setSelectedTime("");
      setNotes("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canGoNext = () => {
    switch (step) {
      case "service":
        return !!selectedService;
      case "employee":
        return !!selectedEmployee;
      case "datetime":
        return !!selectedTime;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (step === "service" && selectedService) setStep("employee");
    else if (step === "employee" && selectedEmployee) setStep("datetime");
    else if (step === "datetime" && selectedTime) setStep("confirm");
  };

  const goBack = () => {
    if (step === "employee") setStep("service");
    else if (step === "datetime") setStep("employee");
    else if (step === "confirm") setStep("datetime");
  };

  const activeServices = services.filter((s) => s.isActive);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Nueva Reserva
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Step 1: Seleccionar servicio */}
        {step === "service" && (
          <div className="space-y-4">
            <Label>Selecciona un servicio</Label>
            <div className="grid gap-2">
              {activeServices.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No hay servicios disponibles
                </p>
              ) : (
                activeServices.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-colors ${
                      selectedService?.id === service.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    }`}
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {service.duration} minutos
                          </p>
                        </div>
                        {selectedService?.id === service.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 2: Seleccionar empleado */}
        {step === "employee" && (
          <div className="space-y-4">
            <Label>Selecciona un profesional</Label>
            {loadingEmployees ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : availableEmployees.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No hay profesionales disponibles para este servicio
              </p>
            ) : (
              <div className="grid gap-2">
                {availableEmployees.map((employee) => (
                  <Card
                    key={employee.id}
                    className={`cursor-pointer transition-colors ${
                      selectedEmployee?.id === employee.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    }`}
                    onClick={() => handleEmployeeSelect(employee.id)}
                  >
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{employee.name}</p>
                        {selectedEmployee?.id === employee.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Seleccionar fecha y hora */}
        {step === "datetime" && (
          <div className="space-y-4">
            <div>
              <Label>Selecciona fecha</Label>
              <div className="mt-2 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  locale={es}
                  className="rounded-md border"
                />
              </div>
            </div>

            <div>
              <Label>Selecciona hora</Label>
              {loadingSlots ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No hay horarios disponibles para esta fecha
                </p>
              ) : (
                <TimeSlotPicker
                  slots={availableSlots}
                  selectedSlot={selectedTime}
                  onSelect={setSelectedTime}
                />
              )}
            </div>
          </div>
        )}

        {/* Step 4: Confirmación */}
        {step === "confirm" && selectedService && selectedEmployee && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Servicio:</span>
                <span className="font-medium">{selectedService.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profesional:</span>
                <span className="font-medium">{selectedEmployee.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha:</span>
                <span className="font-medium">
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hora:</span>
                <span className="font-medium">{selectedTime} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duración:</span>
                <span className="font-medium">{selectedService.duration} min</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="¿Algo que debamos saber?"
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          {step !== "service" ? (
            <Button variant="outline" onClick={goBack} disabled={isSubmitting}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Atrás
            </Button>
          ) : (
            <div />
          )}

          {step === "confirm" ? (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Reservando..." : "Confirmar Reserva"}
            </Button>
          ) : (
            <Button onClick={goNext} disabled={!canGoNext()}>
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
