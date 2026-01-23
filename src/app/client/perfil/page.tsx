"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getClientByUserId, updateClient } from "@/lib/firebase/firestore/clients";
import { ProfileCard, EditPhoneDialog, EstablishmentInfo } from "@/components/client/profile";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import type { Client } from "@/types";

export default function PerfilPage() {
  const { user, establishment, signOut } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editPhoneOpen, setEditPhoneOpen] = useState(false);

  const loadClient = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const clientData = await getClientByUserId(user.id);
      setClient(clientData);
    } catch (error) {
      console.error("Error loading client:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  const handleSavePhone = async (phone: string) => {
    if (!client) return;

    try {
      await updateClient(client.id, { phone });
      setClient({ ...client, phone });
      toast.success("Teléfono actualizado");
    } catch (error) {
      console.error("Error updating phone:", error);
      toast.error("Error al actualizar el teléfono");
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  const currencySymbol = establishment?.currencySymbol || "⭐";
  const currencyName = establishment?.currencyName || "Puntos";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontró tu perfil</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Tu información y código QR
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ProfileCard
          client={client}
          currencySymbol={currencySymbol}
          currencyName={currencyName}
          onEditPhone={() => setEditPhoneOpen(true)}
        />

        <div className="space-y-6">
          {establishment && (
            <EstablishmentInfo establishment={establishment} />
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      <EditPhoneDialog
        open={editPhoneOpen}
        onOpenChange={setEditPhoneOpen}
        currentPhone={client.phone}
        onSave={handleSavePhone}
      />
    </div>
  );
}
