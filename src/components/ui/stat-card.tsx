import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  gradient?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  gradient,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {gradient && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br",
            gradient
          )}
        />
      )}

      <div className="relative flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{value}</span>
            {trend && trend !== "neutral" && (
              <span
                className={cn(
                  "flex items-center",
                  trend === "up" && "text-emerald-500",
                  trend === "down" && "text-destructive"
                )}
              >
                {trend === "up" ? (
                  <TrendingUp className="size-4" />
                ) : (
                  <TrendingDown className="size-4" />
                )}
              </span>
            )}
          </div>
          {description && (
            <span className="text-xs text-muted-foreground">
              {description}
            </span>
          )}
        </div>

        {Icon && (
          <div className="shrink-0">
            <Icon className="size-8 text-muted-foreground/50" />
          </div>
        )}
      </div>
    </Card>
  );
}
