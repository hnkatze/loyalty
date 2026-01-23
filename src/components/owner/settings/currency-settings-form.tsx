"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateEstablishment } from "@/lib/firebase/firestore/establishments";
import { toast } from "sonner";
import type { Establishment } from "@/types";

interface CurrencySettingsFormProps {
  establishment: Establishment;
  onUpdate: (updated: Partial<Establishment>) => void;
}

const SUGGESTED_SYMBOLS = ["⭐", "💎", "🪙", "💰", "🎯", "✨"];

export function CurrencySettingsForm({
  establishment,
  onUpdate,
}: CurrencySettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currencyName: establishment.currencyName || "Puntos",
    currencySymbol: establishment.currencySymbol || "⭐",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectSymbol = (symbol: string) => {
    setFormData((prev) => ({ ...prev, currencySymbol: symbol }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateEstablishment(establishment.id, formData);
      onUpdate(formData);
      toast.success("Configuracion de moneda actualizada");
    } catch (error) {
      console.error("Error updating currency settings:", error);
      toast.error("Error al actualizar la configuracion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuracion de Moneda</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currencyName">Nombre de la moneda</Label>
            <Input
              id="currencyName"
              name="currencyName"
              value={formData.currencyName}
              onChange={handleChange}
              placeholder="Ej: Puntos, Creditos, Estrellas"
              required
            />
            <p className="text-sm text-muted-foreground">
              Este nombre se mostrara a los clientes (ej: Tienes 50 Puntos)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currencySymbol">Simbolo</Label>
            <Input
              id="currencySymbol"
              name="currencySymbol"
              value={formData.currencySymbol}
              onChange={handleChange}
              placeholder="Ej: ⭐"
              className="w-24 text-center text-2xl"
              maxLength={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Simbolos sugeridos</Label>
            <div className="flex gap-2 flex-wrap">
              {SUGGESTED_SYMBOLS.map((symbol) => (
                <Button
                  key={symbol}
                  type="button"
                  variant={
                    formData.currencySymbol === symbol ? "default" : "outline"
                  }
                  size="lg"
                  className="text-2xl w-12 h-12"
                  onClick={() => selectSymbol(symbol)}
                >
                  {symbol}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
            <p className="text-lg font-medium">
              {formData.currencySymbol} 100 {formData.currencyName}
            </p>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar configuracion"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
