import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

/**
 * Matches the StatCard shape: rounded-2xl card with title, value, and description.
 */
function SkeletonStatCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-card flex flex-col gap-3 rounded-2xl ring-1 ring-border/50 p-4 md:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_24px_rgba(0,0,0,0.06)]",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

/**
 * Horizontal list item with avatar circle and two text lines.
 */
function SkeletonListItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-16 items-center gap-3 rounded-2xl bg-card px-4 ring-1 ring-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_24px_rgba(0,0,0,0.06)]",
        className
      )}
      {...props}
    >
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

/**
 * Full card skeleton with header line and 3 body lines.
 */
function SkeletonCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-card flex flex-col gap-4 rounded-2xl ring-1 ring-border/50 p-4 md:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_24px_rgba(0,0,0,0.06)]",
        className
      )}
      {...props}
    >
      <Skeleton className="h-5 w-40" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  )
}

/**
 * Circular avatar placeholder.
 */
function SkeletonAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Skeleton
      className={cn("size-16 rounded-full", className)}
      {...props}
    />
  )
}

/**
 * Calendar month grid: 7 columns x 5 rows of small rounded blocks.
 */
function SkeletonCalendar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-card flex flex-col gap-3 rounded-2xl ring-1 ring-border/50 p-4 md:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_24px_rgba(0,0,0,0.06)]",
        className
      )}
      {...props}
    >
      {/* Month header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <div className="flex gap-2">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`label-${i}`} className="mx-auto h-4 w-8" />
        ))}
      </div>

      {/* Day cells: 5 rows x 7 columns */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={`day-${i}`} className="h-8 rounded-md" />
        ))}
      </div>
    </div>
  )
}

export {
  SkeletonStatCard,
  SkeletonListItem,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonCalendar,
}
