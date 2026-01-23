"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleButton } from "./google-button";
import { useAuth } from "@/hooks/use-auth";

export function LoginForm() {
  const { user, loading, error, needsSetup, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (needsSetup) {
        // Nuevo usuario, redirigir a setup
        router.push("/setup");
      } else if (user) {
        // Usuario existente, redirigir según rol
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Bienvenido</CardTitle>
        <CardDescription>
          Inicia sesión con tu cuenta de Google para continuar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
            {error}
          </div>
        )}
        <GoogleButton onClick={signInWithGoogle} />
      </CardContent>
    </Card>
  );
}
