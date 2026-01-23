"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  getRedemptionByCode,
  confirmRedemption,
  getPendingRedemptionsByEstablishment,
} from "@/lib/firebase/firestore/redemptions";
import { toast } from "sonner";
import { Ticket, Search, CheckCircle, Clock, User, Gift, AlertCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Redemption } from "@/types";

export default function CanjesPage() {
  const { user, establishment, loading: authLoading } = useAuth();
  const [codeInput, setCodeInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundRedemption, setFoundRedemption] = useState<Redemption | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pendingRedemptions, setPendingRedemptions] = useState<Redemption[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);

  const loadPendingRedemptions = useCallback(async () => {
    if (!establishment?.id) return;

    setLoadingPending(true);
    try {
      const redemptions = await getPendingRedemptionsByEstablishment(establishment.id);
      // Filtrar los que no han expirado
      const valid = redemptions.filter((r) => new Date() < r.expiresAt);
      setPendingRedemptions(valid);
    } catch (error) {
      console.error("Error loading pending redemptions:", error);
    } finally {
      setLoadingPending(false);
    }
  }, [establishment?.id]);

  useEffect(() => {
    loadPendingRedemptions();
  }, [loadPendingRedemptions]);

  const handleSearch = async () => {
    if (!codeInput.trim() || !establishment) return;

    setSearching(true);
    setFoundRedemption(null);

    try {
      const redemption = await getRedemptionByCode(establishment.id, codeInput.trim());

      if (!redemption) {
        toast.error("Codigo no encontrado");
        return;
      }

      // Verificar si ha expirado
      if (new Date() > redemption.expiresAt) {
        toast.error("Este canje ha expirado");
        return;
      }

      if (redemption.status !== "pending") {
        toast.error(
          `Este canje ya esta ${
            redemption.status === "confirmed"
              ? "confirmado"
              : redemption.status === "cancelled"
              ? "cancelado"
              : "expirado"
          }`
        );
        return;
      }

      setFoundRedemption(redemption);
    } catch (error) {
      console.error("Error searching redemption:", error);
      toast.error("Error al buscar el canje");
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = async () => {
    if (!foundRedemption || !user) return;

    setConfirming(true);
    try {
      const result = await confirmRedemption(foundRedemption.id, user.id);

      if (result.success) {
        toast.success("Canje confirmado exitosamente");
        setFoundRedemption(null);
        setCodeInput("");
        loadPendingRedemptions();
      } else {
        toast.error(result.error || "Error al confirmar");
      }
    } catch (error) {
      console.error("Error confirming redemption:", error);
      toast.error("Error al confirmar el canje");
    } finally {
      setConfirming(false);
    }
  };

  const handleSelectPending = (redemption: Redemption) => {
    setFoundRedemption(redemption);
    setCodeInput(redemption.code);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin text-4xl">...</div>
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
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Ticket className="h-8 w-8" />
          Confirmar Canjes
        </h1>
        <p className="text-muted-foreground">
          Ingresa el codigo de canje del cliente para confirmar la entrega
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Buscar codigo */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar por codigo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="redemptionCode">Codigo de canje</Label>
                  <Input
                    id="redemptionCode"
                    placeholder="Ej: CJ-ABC123"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    className="text-2xl font-mono text-center tracking-wider"
                    maxLength={10}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleSearch}
                  disabled={!codeInput.trim() || searching}
                >
                  {searching ? "Buscando..." : "Buscar canje"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Detalles del canje encontrado */}
          {foundRedemption && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Detalles del Canje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Codigo</span>
                  <span className="font-mono font-bold text-lg">
                    {foundRedemption.code}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Cliente
                  </span>
                  <span className="font-medium">{foundRedemption.clientName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Gift className="h-4 w-4" />
                    Recompensa
                  </span>
                  <span className="font-medium">{foundRedemption.rewardName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Costo</span>
                  <span className="font-bold text-primary">
                    {foundRedemption.rewardCost} {establishment.currencySymbol}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Creado
                  </span>
                  <span className="text-sm">
                    {format(foundRedemption.createdAt, "dd/MM/yyyy HH:mm")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Expira
                  </span>
                  <span className="text-sm text-orange-600">
                    {formatDistanceToNow(foundRedemption.expiresAt, {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>

                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={handleConfirm}
                  disabled={confirming}
                >
                  {confirming ? (
                    "Confirmando..."
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Confirmar Entrega
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lista de canjes pendientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Canjes Pendientes
              {pendingRedemptions.length > 0 && (
                <Badge variant="secondary">{pendingRedemptions.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPending ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando...
              </div>
            ) : pendingRedemptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay canjes pendientes
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRedemptions.map((redemption) => (
                  <div
                    key={redemption.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSelectPending(redemption)}
                  >
                    <div>
                      <p className="font-mono font-bold">{redemption.code}</p>
                      <p className="text-sm text-muted-foreground">
                        {redemption.clientName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {redemption.rewardName}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {redemption.rewardCost} {establishment.currencySymbol}
                      </Badge>
                      <p className="text-xs text-orange-600">
                        Expira{" "}
                        {formatDistanceToNow(redemption.expiresAt, {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
