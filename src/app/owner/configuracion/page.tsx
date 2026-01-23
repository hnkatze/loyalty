"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EstablishmentInfoForm,
  BusinessHoursForm,
  CurrencySettingsForm,
} from "@/components/owner/settings";
import { Building2, Clock, Coins } from "lucide-react";
import type { Establishment } from "@/types";

export default function ConfiguracionPage() {
  const { establishment: initialEstablishment, loading } = useAuth();
  const [establishment, setEstablishment] = useState<Establishment | null>(
    initialEstablishment
  );

  // Actualizar estado local cuando cambia el establishment del auth
  useState(() => {
    if (initialEstablishment) {
      setEstablishment(initialEstablishment);
    }
  });

  const handleUpdate = (updated: Partial<Establishment>) => {
    if (establishment) {
      setEstablishment({ ...establishment, ...updated });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          No se encontro el establecimiento.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuracion</h1>
        <p className="text-muted-foreground">
          Configura la informacion de tu establecimiento
        </p>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Informacion</span>
          </TabsTrigger>
          <TabsTrigger value="hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Horarios</span>
          </TabsTrigger>
          <TabsTrigger value="currency" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span className="hidden sm:inline">Moneda</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <EstablishmentInfoForm
            establishment={establishment}
            onUpdate={handleUpdate}
          />
        </TabsContent>

        <TabsContent value="hours">
          <BusinessHoursForm
            establishment={establishment}
            onUpdate={handleUpdate}
          />
        </TabsContent>

        <TabsContent value="currency">
          <CurrencySettingsForm
            establishment={establishment}
            onUpdate={handleUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
