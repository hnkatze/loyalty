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
import type { Reward, Establishment } from "@/types";

interface RewardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: Reward | null;
  establishment: Establishment | null;
  onSubmit: (data: {
    name: string;
    description: string;
    cost: number;
    isActive: boolean;
  }) => Promise<void>;
}

export function RewardFormDialog({
  open,
  onOpenChange,
  reward,
  establishment,
  onSubmit,
}: RewardFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!reward;

  useEffect(() => {
    if (open) {
      if (reward) {
        setName(reward.name);
        setDescription(reward.description || "");
        setCost(String(reward.cost));
        setIsActive(reward.isActive);
      } else {
        setName("");
        setDescription("");
        setCost("");
        setIsActive(true);
      }
    }
  }, [open, reward]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const costNum = parseInt(cost, 10);
    if (isNaN(costNum) || costNum <= 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        description,
        cost: costNum,
        isActive,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestedCosts = [50, 100, 200, 500];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar recompensa" : "Nueva recompensa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la recompensa</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Corte de cabello gratis"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la recompensa..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">
              Costo en {establishment?.currencyName || "puntos"}
            </Label>
            <Input
              id="cost"
              type="number"
              min="1"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="Ej: 100"
              required
            />
            <div className="flex gap-2 flex-wrap">
              {suggestedCosts.map((c) => (
                <Button
                  key={c}
                  type="button"
                  variant={cost === String(c) ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCost(String(c))}
                >
                  {establishment?.currencySymbol} {c}
                </Button>
              ))}
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Recompensa activa</p>
                <p className="text-sm text-muted-foreground">
                  Los clientes pueden canjear esta recompensa
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
              disabled={!name || !cost || parseInt(cost) <= 0 || isSubmitting}
            >
              {isSubmitting
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear recompensa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
