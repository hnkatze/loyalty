"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";
import type { Reward } from "@/types";

interface RewardCardProps {
  reward: Reward;
  clientBalance: number;
  currencySymbol: string;
  onRedeem: (reward: Reward) => void;
}

export function RewardCard({
  reward,
  clientBalance,
  currencySymbol,
  onRedeem,
}: RewardCardProps) {
  const canRedeem = clientBalance >= reward.cost;

  return (
    <Card className={!canRedeem ? "opacity-60" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">{reward.name}</CardTitle>
          </div>
          {canRedeem && (
            <Badge variant="default" className="bg-green-500">
              Disponible
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {reward.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {reward.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Costo:</span>
          <span className="text-xl font-bold text-primary">
            {reward.cost} {currencySymbol}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          disabled={!canRedeem}
          onClick={() => onRedeem(reward)}
        >
          {canRedeem ? "Canjear" : `Necesitas ${reward.cost - clientBalance} más`}
        </Button>
      </CardFooter>
    </Card>
  );
}
