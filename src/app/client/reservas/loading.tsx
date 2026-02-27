import { SkeletonCalendar, SkeletonListItem } from "@/components/ui/skeleton-patterns";

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      <SkeletonCalendar />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    </div>
  );
}
