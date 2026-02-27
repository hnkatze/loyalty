"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getClientByUserId } from "@/lib/firebase/firestore/clients";
import { getTransactionsByClient } from "@/lib/firebase/firestore/transactions";
import { TransactionList } from "@/components/client/transactions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/ui/stat-card";
import { toast } from "sonner";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import type { Client, Transaction, TransactionType } from "@/types";

export default function HistorialPage() {
  const { user, establishment } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | TransactionType>("all");

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const clientData = await getClientByUserId(user.id);
      setClient(clientData);

      if (clientData) {
        const transactionsData = await getTransactionsByClient(clientData.id);
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast.error("Error al cargar el historial");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.type === filter);

  const totalEarned = transactions
    .filter((t) => t.type === "earned")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRedeemed = transactions
    .filter((t) => t.type === "redeemed")
    .reduce((sum, t) => sum + t.amount, 0);

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
        <h1 className="text-xl font-bold md:text-2xl">Historial</h1>
        <p className="text-muted-foreground">
          Tus movimientos de {currencyName.toLowerCase()}
        </p>
      </div>

      {/* Resumen */}
      <div className="grid gap-3 md:gap-4 md:grid-cols-3">
        <StatCard
          title="Balance actual"
          value={`${client?.balance || 0} ${currencySymbol}`}
          icon={Wallet}
          gradient="from-primary/5 to-transparent"
        />
        <StatCard
          title="Total ganado"
          value={`+${totalEarned} ${currencySymbol}`}
          icon={TrendingUp}
          trend="up"
          gradient="from-emerald-500/5 to-transparent"
        />
        <StatCard
          title="Total canjeado"
          value={`-${totalRedeemed} ${currencySymbol}`}
          icon={TrendingDown}
          trend="down"
          gradient="from-red-500/5 to-transparent"
        />
      </div>

      {/* Filtros y lista */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            Todos ({transactions.length})
          </TabsTrigger>
          <TabsTrigger value="earned">
            Ganados ({transactions.filter((t) => t.type === "earned").length})
          </TabsTrigger>
          <TabsTrigger value="redeemed">
            Canjeados ({transactions.filter((t) => t.type === "redeemed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          <TransactionList
            transactions={filteredTransactions}
            currencySymbol={currencySymbol}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
