"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const { user, loading, needsSetup } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (needsSetup) {
        router.push("/setup");
      } else if (user) {
        if (user.role === "owner") {
          router.push("/owner/dashboard");
        } else {
          router.push("/client/dashboard");
        }
      }
    }
  }, [user, loading, needsSetup, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex justify-end">
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold tracking-tight">
            Loyalty
          </h1>
          <p className="text-xl text-muted-foreground">
            Sistema de puntos y reservas para barberías y salones.
            Fideliza a tus clientes y gestiona tu agenda en un solo lugar.
          </p>

          <Button size="lg" asChild>
            <Link href="/login">Comenzar</Link>
          </Button>
        </div>
      </main>

      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Loyalty. Todos los derechos reservados.
      </footer>
    </div>
  );
}
