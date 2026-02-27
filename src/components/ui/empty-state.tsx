import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[300px] gap-4 p-8",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4">
        <Icon className="size-12 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm text-center">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
