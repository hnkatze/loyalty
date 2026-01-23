"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClientSidebar, clientNavItems, MobileHeader } from "@/components/layout";
import { ThemeToggle } from "@/components/theme-toggle";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⏳</div>
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
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
