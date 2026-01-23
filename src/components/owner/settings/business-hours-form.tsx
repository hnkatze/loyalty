"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateEstablishment } from "@/lib/firebase/firestore/establishments";
import { toast } from "sonner";
import type { Establishment, BusinessHours, DayHours } from "@/types";

interface BusinessHoursFormProps {
  establishment: Establishment;
  onUpdate: (updated: Partial<Establishment>) => void;
}

type DayKey = keyof BusinessHours;

const DAYS: { key: DayKey; label: string }[] = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miercoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sabado" },
  { key: "sunday", label: "Domingo" },
];

const DEFAULT_HOURS: DayHours = {
  open: "09:00",
  close: "18:00",
  closed: false,
};

export function BusinessHoursForm({
  establishment,
  onUpdate,
}: BusinessHoursFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hours, setHours] = useState<BusinessHours>(() => {
    const initial: BusinessHours = {};
    DAYS.forEach(({ key }) => {
      initial[key] = establishment.hours[key] || { ...DEFAULT_HOURS };
    });
    return initial;
  });

  const handleDayChange = (
    day: DayKey,
    field: keyof DayHours,
    value: string | boolean
  ) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateEstablishment(establishment.id, { hours });
      onUpdate({ hours });
      toast.success("Horarios actualizados correctamente");
    } catch (error) {
      console.error("Error updating hours:", error);
      toast.error("Error al actualizar los horarios");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horarios de Atencion</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {DAYS.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center gap-4 p-3 rounded-lg border"
            >
              <div className="w-24 font-medium">{label}</div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={!hours[key]?.closed}
                  onCheckedChange={(checked) =>
                    handleDayChange(key, "closed", !checked)
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {hours[key]?.closed ? "Cerrado" : "Abierto"}
                </span>
              </div>

              {!hours[key]?.closed && (
                <>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${key}-open`} className="sr-only">
                      Apertura
                    </Label>
                    <Input
                      id={`${key}-open`}
                      type="time"
                      value={hours[key]?.open || "09:00"}
                      onChange={(e) =>
                        handleDayChange(key, "open", e.target.value)
                      }
                      className="w-32"
                    />
                  </div>
                  <span className="text-muted-foreground">a</span>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${key}-close`} className="sr-only">
                      Cierre
                    </Label>
                    <Input
                      id={`${key}-close`}
                      type="time"
                      value={hours[key]?.close || "18:00"}
                      onChange={(e) =>
                        handleDayChange(key, "close", e.target.value)
                      }
                      className="w-32"
                    />
                  </div>
                </>
              )}
            </div>
          ))}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar horarios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
