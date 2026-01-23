"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SetupPage() {
  const {
    user,
    establishment,
    loading,
    error,
    needsSetup,
    isFirstUser,
    completeOwnerSetup,
    completeClientSetup,
    signOut,
  } = useAuth();
  const router = useRouter();

  const [establishmentName, setEstablishmentName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Si ya tiene usuario registrado, redirigir
      if (user && !needsSetup) {
        if (user.role === "owner") {
          router.push("/owner/dashboard");
        } else {
          router.push("/client/dashboard");
        }
      }
      // Si no necesita setup y no hay usuario, volver al login
      if (!needsSetup && !user) {
        router.push("/login");
      }
    }
  }, [user, loading, needsSetup, router]);

  const handleOwnerSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishmentName.trim()) return;

    setIsSubmitting(true);
    try {
      await completeOwnerSetup(establishmentName.trim());
    } catch (err) {
      console.error("Error in owner setup:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setIsSubmitting(true);
    try {
      await completeClientSetup(phone.trim());
    } catch (err) {
      console.error("Error in client setup:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  if (!needsSetup) {
    return null;
  }

  // Primer usuario: configuración de dueño
  if (isFirstUser) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Configura tu negocio</CardTitle>
          <CardDescription>
            Eres el primer usuario. Ingresa el nombre de tu establecimiento para
            comenzar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOwnerSetup} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="establishmentName">Nombre del establecimiento</Label>
              <Input
                id="establishmentName"
                placeholder="Ej: Barbería El Corte"
                value={establishmentName}
                onChange={(e) => setEstablishmentName(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={signOut}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear negocio"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Usuario posterior: registro como cliente
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Completa tu registro</CardTitle>
        <CardDescription>
          {establishment
            ? `Te registrarás como cliente de ${establishment.name}`
            : "Ingresa tu teléfono para completar el registro"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleClientSetup} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="phone">Número de teléfono</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Ej: +57 300 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={signOut}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Completar registro"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
