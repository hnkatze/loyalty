"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface TimeSlotPickerProps {
  slots: string[];
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
  loading?: boolean;
}

export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelect,
  loading,
}: TimeSlotPickerProps) {
  if (loading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Cargando horarios disponibles...
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-4">
        <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          No hay horarios disponibles para esta fecha
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Selecciona un horario</Label>
      <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-1">
        {slots.map((slot) => (
          <Button
            key={slot}
            type="button"
            variant={selectedSlot === slot ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(slot)}
            className="text-sm"
          >
            {slot}
          </Button>
        ))}
      </div>
    </div>
  );
}
