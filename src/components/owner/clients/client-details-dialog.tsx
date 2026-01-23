"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClientQRCode } from "./client-qr-code";
import { getTransactionsByClient } from "@/lib/firebase/firestore/transactions";
import { getActiveRewards } from "@/lib/firebase/firestore/rewards";
import { User, History, QrCode, Gift } from "lucide-react";
import type { Client, Transaction, Establishment, Reward } from "@/types";

interface ClientDetailsDialogProps {
  client: Client | null;
  establishment: Establishment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRedeemReward?: (reward: Reward, client: Client) => void;
}

export function ClientDetailsDialog({
  client,
  establishment,
  open,
  onOpenChange,
  onRedeemReward,
}: ClientDetailsDialogProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!client || !establishment) return;

      setLoadingTransactions(true);
      setLoadingRewards(true);

      try {
        const [txData, rewardsData] = await Promise.all([
          getTransactionsByClient(client.id),
          getActiveRewards(establishment.id),
        ]);
        setTransactions(txData);
        setRewards(rewardsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoadingTransactions(false);
        setLoadingRewards(false);
      }
    };

    if (open && client) {
      loadData();
    }
  }, [client, establishment, open]);

  if (!client) return null;

  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={client.avatarURL} alt={client.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{client.name}</p>
              <p className="text-sm text-muted-foreground font-normal">
                {client.email}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 py-4">
          <span className="text-4xl font-bold">
            {establishment?.currencySymbol || "⭐"} {client.balance}
          </span>
          <span className="text-muted-foreground">
            {establishment?.currencyName || "Puntos"}
          </span>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Info
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Canjear
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telefono</span>
                  <span>{client.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{client.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registrado</span>
                  <span>{formatDate(client.createdAt)}</span>
                </div>
                {client.lastVisit && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ultima visita</span>
                    <span>{formatDate(client.lastVisit)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {loadingTransactions ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando historial...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay transacciones registradas
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {transactions.map((tx) => (
                  <Card key={tx.id}>
                    <CardContent className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {tx.type === "earned" ? "Puntos ganados" : "Canjeado"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(tx.createdAt)}
                        </p>
                        {tx.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {tx.notes}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={tx.type === "earned" ? "default" : "secondary"}
                      >
                        {tx.type === "earned" ? "+" : "-"}
                        {establishment?.currencySymbol || "⭐"} {tx.amount}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rewards" className="mt-4">
            {loadingRewards ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando recompensas...
              </div>
            ) : rewards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay recompensas disponibles
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {rewards.map((reward) => {
                  const canRedeem = client.balance >= reward.cost;
                  return (
                    <Card key={reward.id}>
                      <CardContent className="py-3 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{reward.name}</p>
                          {reward.description && (
                            <p className="text-sm text-muted-foreground">
                              {reward.description}
                            </p>
                          )}
                          <p className="text-sm font-semibold mt-1">
                            {establishment?.currencySymbol} {reward.cost}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          disabled={!canRedeem || !onRedeemReward}
                          onClick={() => onRedeemReward?.(reward, client)}
                        >
                          {canRedeem ? "Canjear" : "Saldo insuficiente"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="qr" className="mt-4 flex justify-center">
            <ClientQRCode client={client} size={180} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
