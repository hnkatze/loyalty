"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X, Check } from "lucide-react";
import type { Client, Establishment } from "@/types";

interface PointsFormProps {
  client: Client;
  establishment: Establishment;
  onSubmit: (points: number, notes: string) => Promise<void>;
  onCancel: () => void;
}

export function PointsForm({
  client,
  establishment,
  onSubmit,
  onCancel,
}: PointsFormProps) {
  const [points, setPoints] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pointsNum = parseInt(points, 10);
    if (isNaN(pointsNum) || pointsNum <= 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(pointsNum, notes);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickPoints = [10, 25, 50, 100];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Otorgar {establishment.currencyName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info del cliente */}
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <Avatar className="h-14 w-14">
            <AvatarImage src={client.avatarURL} alt={client.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-lg">{client.name}</p>
            <p className="text-sm text-muted-foreground">{client.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Balance actual</p>
            <Badge variant="secondary" className="text-lg">
              {establishment.currencySymbol} {client.balance}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="points">
              Cantidad de {establishment.currencyName}
            </Label>
            <Input
              id="points"
              type="number"
              min="1"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="Ingresa la cantidad"
              className="text-2xl h-14 text-center"
              required
            />
          </div>

          {/* Botones rapidos */}
          <div className="flex gap-2 justify-center">
            {quickPoints.map((qp) => (
              <Button
                key={qp}
                type="button"
                variant={points === String(qp) ? "default" : "outline"}
                size="sm"
                onClick={() => setPoints(String(qp))}
              >
                +{qp}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Nota (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Corte de cabello, compra de productos..."
              rows={2}
            />
          </div>

          {points && parseInt(points) > 0 && (
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Nuevo balance</p>
              <p className="text-2xl font-bold">
                {establishment.currencySymbol}{" "}
                {client.balance + parseInt(points)}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!points || parseInt(points) <= 0 || isSubmitting}
            >
              <Check className="mr-2 h-4 w-4" />
              {isSubmitting ? "Guardando..." : "Confirmar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
