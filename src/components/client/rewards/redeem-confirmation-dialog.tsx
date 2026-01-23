"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Clock, Copy, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createRedemption } from "@/lib/firebase/firestore/redemptions";
import type { Reward } from "@/types";

interface RedeemConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: Reward | null;
  clientId: string;
  clientName: string;
  clientBalance: number;
  establishmentId: string;
  currencySymbol: string;
  onSuccess: (newBalance: number, code: string) => void;
}

export function RedeemConfirmationDialog({
  open,
  onOpenChange,
  reward,
  clientId,
  clientName,
  clientBalance,
  establishmentId,
  currencySymbol,
  onSuccess,
}: RedeemConfirmationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redeemCode, setRedeemCode] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!reward) return;

    setIsSubmitting(true);
    try {
      const result = await createRedemption({
        establishmentId,
        clientId,
        clientName,
        currentBalance: clientBalance,
        rewardId: reward.id,
        rewardName: reward.name,
        rewardCost: reward.cost,
      });

      if (result.success && result.code) {
        setRedeemCode(result.code);
        onSuccess(clientBalance - reward.cost, result.code);
      } else {
        toast.error(result.error || "Error al canjear la recompensa");
      }
    } catch (error) {
      console.error("Error creating redemption:", error);
      toast.error("Error al procesar el canje");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Primero cerrar el dialogo, luego limpiar el estado
    // para evitar que se muestre la vista de confirmacion por un momento
    onOpenChange(false);
    setTimeout(() => setRedeemCode(null), 200);
  };

  const copyCode = () => {
    if (redeemCode) {
      navigator.clipboard.writeText(redeemCode);
      toast.success("Codigo copiado");
    }
  };

  if (!reward) return null;

  // Mostrar exito con codigo pendiente
  if (redeemCode) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-orange-100 w-fit dark:bg-orange-900">
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <DialogTitle>Canje Pendiente</DialogTitle>
            <DialogDescription>
              Has solicitado: {reward.name}
            </DialogDescription>
          </DialogHeader>

          <Card className="bg-muted">
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Tu codigo de canje:
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-mono font-bold">
                  {redeemCode}
                </span>
                <Button variant="ghost" size="icon" onClick={copyCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-800 dark:text-orange-200">
                Importante
              </p>
              <p className="text-orange-700 dark:text-orange-300">
                Muestra este codigo al personal para que confirmen la entrega.
                El codigo expira en 24 horas.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button className="w-full" onClick={handleClose}>
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Mostrar confirmacion
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Confirmar canje
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="py-4">
              <p className="font-medium">{reward.name}</p>
              {reward.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {reward.description}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Costo:</span>
              <span className="font-medium">
                {reward.cost} {currencySymbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tu balance:</span>
              <span className="font-medium">
                {clientBalance} {currencySymbol}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">Balance despues:</span>
              <span className="font-bold text-primary">
                {clientBalance - reward.cost} {currencySymbol}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
            <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Recibiras un codigo que debes mostrar al personal para completar el canje.
              Los puntos se reservaran hasta que el canje sea confirmado.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Procesando..." : "Confirmar canje"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
