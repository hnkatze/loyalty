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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Employee, EmployeeAvailability } from "@/types";

interface EmployeeAvailabilityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSubmit: (availability: EmployeeAvailability) => Promise<void>;
}

const DAYS = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return { value: `${hour}:00`, label: `${hour}:00` };
});

interface DayAvailability {
  enabled: boolean;
  start: string;
  end: string;
}

type WeekAvailability = Record<string, DayAvailability>;

export function EmployeeAvailabilityForm({
  open,
  onOpenChange,
  employee,
  onSubmit,
}: EmployeeAvailabilityFormProps) {
  const [availability, setAvailability] = useState<WeekAvailability>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && employee) {
      const initial: WeekAvailability = {};
      DAYS.forEach(({ key }) => {
        const dayData = employee.availability?.[key];
        initial[key] = {
          enabled: !!dayData,
          start: dayData?.start || "09:00",
          end: dayData?.end || "18:00",
        };
      });
      setAvailability(initial);
    }
  }, [open, employee]);

  const handleToggleDay = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day]?.enabled,
      },
    }));
  };

  const handleChangeTime = (day: string, field: "start" | "end", value: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result: EmployeeAvailability = {};
    DAYS.forEach(({ key }) => {
      const day = availability[key];
      if (day?.enabled) {
        result[key] = {
          start: day.start,
          end: day.end,
        };
      }
    });

    setIsSubmitting(true);
    try {
      await onSubmit(result);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Disponibilidad de {employee.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configura los días y horarios en que este empleado está disponible
            para atender citas.
          </p>

          <div className="space-y-3">
            {DAYS.map(({ key, label }) => {
              const day = availability[key] || { enabled: false, start: "09:00", end: "18:00" };
              return (
                <div
                  key={key}
                  className={`p-3 border rounded-lg ${day.enabled ? "bg-muted/50" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">{label}</Label>
                    <Switch
                      checked={day.enabled}
                      onCheckedChange={() => handleToggleDay(key)}
                    />
                  </div>
                  {day.enabled && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={day.start}
                        onValueChange={(value) => handleChangeTime(key, "start", value)}
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue placeholder="Inicio" />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS.map((h) => (
                            <SelectItem key={h.value} value={h.value}>
                              {h.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-muted-foreground">a</span>
                      <Select
                        value={day.end}
                        onValueChange={(value) => handleChangeTime(key, "end", value)}
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue placeholder="Fin" />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS.map((h) => (
                            <SelectItem key={h.value} value={h.value}>
                              {h.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar disponibilidad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
