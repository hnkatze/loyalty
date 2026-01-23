"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Gift, AlertCircle } from "lucide-react";
import type { Reward, Client, Establishment } from "@/types";

interface RedeemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: Reward | null;
  client: Client | null;
  establishment: Establishment | null;
  onConfirm: () => Promise<void>;
}

export function RedeemDialog({
  open,
  onOpenChange,
  reward,
  client,
  establishment,
  onConfirm,
}: RedeemDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!reward || !client || !establishment) return null;

  const canRedeem = client.balance >= reward.cost;
  const newBalance = client.balance - reward.cost;

  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Canjear recompensa
          </DialogTitle>
          <DialogDescription>
            Confirma el canje de esta recompensa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info del cliente */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar>
              <AvatarImage src={client.avatarURL} alt={client.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{client.name}</p>
              <p className="text-sm text-muted-foreground">{client.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Balance</p>
              <Badge variant="secondary">
                {establishment.currencySymbol} {client.balance}
              </Badge>
            </div>
          </div>

          {/* Recompensa */}
          <div className="p-4 border rounded-lg">
            <p className="font-semibold text-lg">{reward.name}</p>
            {reward.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {reward.description}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Costo:</span>
              <span className="font-bold text-lg">
                {establishment.currencySymbol} {reward.cost}
              </span>
            </div>
          </div>

          {/* Resultado */}
          {canRedeem ? (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm">Nuevo balance:</span>
                <span className="font-bold text-green-600">
                  {establishment.currencySymbol} {newBalance}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Saldo insuficiente</p>
                <p className="text-sm text-muted-foreground">
                  El cliente necesita{" "}
                  {establishment.currencySymbol} {reward.cost - client.balance}{" "}
                  más para canjear esta recompensa
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canRedeem || isSubmitting}
          >
            {isSubmitting ? "Procesando..." : "Confirmar canje"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
