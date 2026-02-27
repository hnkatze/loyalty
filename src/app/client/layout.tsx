"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClientSidebar, clientNavItems, MobileHeader } from "@/components/layout";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/ui/skeleton-patterns";
import { useAuth } from "@/hooks/use-auth";

export default function ClientLayout({
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
      } else if (user.role !== "client") {
        router.push("/owner/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header placeholder */}
        <div className="h-14 border-b flex items-center px-4">
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

  if (!user || user.role !== "client") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileHeader
        navItems={clientNavItems}
        userName={user?.name}
        userRole="client"
        onSignOut={signOut}
      />
      <ClientSidebar />
      <div className="flex-1 flex flex-col">
        <header className="hidden md:flex h-14 border-b items-center justify-end px-4">
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-0 overflow-auto animate-in fade-in-0 duration-300">
          {children}
        </main>
      </div>
      <BottomTabBar />
    </div>
  );
}
