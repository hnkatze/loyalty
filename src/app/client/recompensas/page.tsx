"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getClientByUserId } from "@/lib/firebase/firestore/clients";
import { getActiveRewards } from "@/lib/firebase/firestore/rewards";
import {
  getPendingRedemptionsByClient,
  cancelRedemption,
} from "@/lib/firebase/firestore/redemptions";
import { RewardCard, RedeemConfirmationDialog } from "@/components/client/rewards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, X, Copy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Client, Reward, Redemption } from "@/types";

export default function RecompensasPage() {
  const { user, establishment } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [pendingRedemptions, setPendingRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id || !establishment?.id) return;

    setLoading(true);
    try {
      const [clientData, rewardsData] = await Promise.all([
        getClientByUserId(user.id),
        getActiveRewards(establishment.id),
      ]);
      setClient(clientData);
      setRewards(rewardsData);

      // Cargar canjes pendientes
      if (clientData) {
        const pending = await getPendingRedemptionsByClient(clientData.id);
        // Filtrar los que no han expirado
        const valid = pending.filter((r) => new Date() < r.expiresAt);
        setPendingRedemptions(valid);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar las recompensas");
    } finally {
      setLoading(false);
    }
  }, [user?.id, establishment?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
    setConfirmDialogOpen(true);
  };

  const handleRedeemSuccess = (newBalance: number) => {
    // Actualizar balance del cliente localmente
    setClient((prev) => (prev ? { ...prev, balance: newBalance } : null));
    // Marcar que necesitamos refrescar cuando se cierre el dialogo
    setNeedsRefresh(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setConfirmDialogOpen(open);
    // Si se cierra el dialogo y hubo un canje, recargar datos
    if (!open && needsRefresh) {
      setNeedsRefresh(false);
      loadData();
    }
  };

  const handleCancelRedemption = async (redemption: Redemption) => {
    if (!client) return;

    setCancellingId(redemption.id);
    try {
      const result = await cancelRedemption(redemption.id, client.balance);

      if (result.success) {
        toast.success("Canje cancelado. Puntos devueltos.");
        // Actualizar balance y lista
        setClient((prev) =>
          prev ? { ...prev, balance: prev.balance + redemption.rewardCost } : null
        );
        setPendingRedemptions((prev) => prev.filter((r) => r.id !== redemption.id));
      } else {
        toast.error(result.error || "Error al cancelar");
      }
    } catch (error) {
      console.error("Error cancelling redemption:", error);
      toast.error("Error al cancelar el canje");
    } finally {
      setCancellingId(null);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Codigo copiado");
  };

  const currencySymbol = establishment?.currencySymbol || "⭐";
  const currencyName = establishment?.currencyName || "Puntos";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recompensas</h1>
        <p className="text-muted-foreground">
          Canjea tus {currencyName.toLowerCase()} por premios
        </p>
      </div>

      {/* Balance actual */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="py-6">
          <div className="text-center">
            <p className="text-sm opacity-90">Tu balance disponible</p>
            <p className="text-4xl font-bold">
              {client?.balance || 0} {currencySymbol}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Canjes pendientes */}
      {pendingRedemptions.length > 0 && (
        <Card className="border-orange-300 dark:border-orange-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Clock className="h-5 w-5" />
              Canjes Pendientes
              <Badge variant="secondary">{pendingRedemptions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRedemptions.map((redemption) => (
                <div
                  key={redemption.id}
                  className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">{redemption.code}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyCode(redemption.code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium">{redemption.rewardName}</p>
                    <p className="text-xs text-muted-foreground">
                      Expira {formatDistanceToNow(redemption.expiresAt, { addSuffix: true, locale: es })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {redemption.rewardCost} {currencySymbol}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleCancelRedemption(redemption)}
                      disabled={cancellingId === redemption.id}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Muestra el codigo al personal para confirmar tu canje
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lista de recompensas */}
      {rewards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No hay recompensas disponibles en este momento
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              clientBalance={client?.balance || 0}
              currencySymbol={currencySymbol}
              onRedeem={handleRedeemClick}
            />
          ))}
        </div>
      )}

      <RedeemConfirmationDialog
        open={confirmDialogOpen}
        onOpenChange={handleDialogOpenChange}
        reward={selectedReward}
        clientId={client?.id || ""}
        clientName={client?.name || ""}
        clientBalance={client?.balance || 0}
        establishmentId={establishment?.id || ""}
        currencySymbol={currencySymbol}
        onSuccess={handleRedeemSuccess}
      />
    </div>
  );
}
