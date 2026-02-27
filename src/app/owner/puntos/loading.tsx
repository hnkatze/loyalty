import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      <Skeleton className="aspect-square max-w-sm mx-auto w-full rounded-2xl" />
      <Skeleton className="h-12 w-full rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  );
}
