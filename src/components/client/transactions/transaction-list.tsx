"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Gift } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Transaction } from "@/types";

interface TransactionListProps {
  transactions: Transaction[];
  currencySymbol: string;
}

export function TransactionList({
  transactions,
  currencySymbol,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No tienes transacciones aún
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <Card key={transaction.id}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    transaction.type === "earned"
                      ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                  }`}
                >
                  {transaction.type === "earned" ? (
                    <ArrowUp className="h-5 w-5" />
                  ) : (
                    <Gift className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {transaction.type === "earned"
                        ? "Puntos ganados"
                        : "Recompensa canjeada"}
                    </span>
                    <Badge
                      variant={
                        transaction.type === "earned"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        transaction.type === "earned"
                          ? "bg-green-500"
                          : "bg-red-500 text-white"
                      }
                    >
                      {transaction.type === "earned" ? "Ganado" : "Canjeado"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(transaction.createdAt, "d 'de' MMMM, yyyy - HH:mm", {
                      locale: es,
                    })}
                  </p>
                  {transaction.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {transaction.notes}
                    </p>
                  )}
                </div>
              </div>
              <div
                className={`text-xl font-bold ${
                  transaction.type === "earned"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {transaction.type === "earned" ? "+" : "-"}
                {transaction.amount} {currencySymbol}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
