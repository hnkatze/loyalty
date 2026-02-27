import { SkeletonCard } from "@/components/ui/skeleton-patterns";

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
