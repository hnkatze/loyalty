"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Phone, MapPin, Clock } from "lucide-react";
import type { Establishment, BusinessHours } from "@/types";

interface EstablishmentInfoProps {
  establishment: Establishment;
}

type DayKey = keyof BusinessHours;

const dayNames: Record<DayKey, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

const dayOrder: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function EstablishmentInfo({ establishment }: EstablishmentInfoProps) {
  const hasHours =
    establishment.hours && Object.keys(establishment.hours).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {establishment.name}
        </CardTitle>
        {establishment.description && (
          <p className="text-sm text-muted-foreground">
            {establishment.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {establishment.phone && (
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span>{establishment.phone}</span>
          </div>
        )}

        {establishment.address && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <span>{establishment.address}</span>
          </div>
        )}

        {hasHours && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Horarios
            </div>
            <div className="grid gap-1 text-sm pl-6">
              {dayOrder.map((day) => {
                const hours = establishment.hours[day];
                if (!hours || hours.closed) return null;

                return (
                  <div key={day} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {dayNames[day]}
                    </span>
                    <span>
                      {hours.open} - {hours.close}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
