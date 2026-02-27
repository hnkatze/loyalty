"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OwnerSidebar, ownerNavItems, MobileHeader } from "@/components/layout";
import { Fab } from "@/components/layout/fab";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/ui/skeleton-patterns";
import { useAuth } from "@/hooks/use-auth";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "owner") {
        router.push("/client/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Sidebar placeholder (desktop) */}
        <div className="hidden md:block w-64 border-r">
          <div className="p-4 flex flex-col gap-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
        {/* Header placeholder (mobile) */}
        <div className="md:hidden h-14 border-b flex items-center px-4">
          <Skeleton className="h-6 w-32" />
        </div>
        {/* Content skeletons */}
        <div className="flex-1 p-4 md:p-6 flex flex-col gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!user || user.role !== "owner") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileHeader
        navItems={ownerNavItems}
        userName={user?.name}
        userRole="owner"
        onSignOut={signOut}
      />
      <OwnerSidebar />
      <div className="flex-1 flex flex-col">
        <header className="hidden md:flex h-14 border-b items-center justify-end px-4">
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto animate-in fade-in-0 duration-300">
          {children}
        </main>
      </div>
      <Fab />
    </div>
  );
}
