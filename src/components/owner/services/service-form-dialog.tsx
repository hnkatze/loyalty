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
import { Switch } from "@/components/ui/switch";
import type { Service } from "@/types";

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  onSubmit: (data: {
    name: string;
    description: string;
    duration: number;
    price: number | undefined;
    isActive: boolean;
  }) => Promise<void>;
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
  onSubmit,
}: ServiceFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("30");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!service;

  useEffect(() => {
    if (open) {
      if (service) {
        setName(service.name);
        setDescription(service.description || "");
        setDuration(String(service.duration));
        setPrice(service.price ? String(service.price) : "");
        setIsActive(service.isActive);
      } else {
        setName("");
        setDescription("");
        setDuration("30");
        setPrice("");
        setIsActive(true);
      }
    }
  }, [open, service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const durationNum = parseInt(duration, 10);
    if (isNaN(durationNum) || durationNum <= 0) return;

    const priceNum = price ? parseInt(price, 10) : undefined;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        description,
        duration: durationNum,
        price: priceNum,
        isActive,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const durationOptions = [15, 30, 45, 60, 90, 120];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar servicio" : "Nuevo servicio"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del servicio</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Corte de cabello"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el servicio..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duración (minutos)</Label>
            <Input
              id="duration"
              type="number"
              min="5"
              step="5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
            <div className="flex gap-2 flex-wrap">
              {durationOptions.map((d) => (
                <Button
                  key={d}
                  type="button"
                  variant={duration === String(d) ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDuration(String(d))}
                >
                  {d} min
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio (opcional)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ej: 25000"
            />
          </div>

          {isEditing && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Servicio activo</p>
                <p className="text-sm text-muted-foreground">
                  Los clientes pueden agendar este servicio
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          )}

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
              disabled={!name || !duration || parseInt(duration) <= 0 || isSubmitting}
            >
              {isSubmitting
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear servicio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
