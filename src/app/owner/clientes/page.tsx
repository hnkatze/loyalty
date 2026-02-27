"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  ClientsTable,
  ClientDetailsDialog,
} from "@/components/owner/clients";
import { RedeemDialog } from "@/components/owner/rewards";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { searchClients, deleteClient } from "@/lib/firebase/firestore/clients";
import { redeemReward } from "@/lib/firebase/firestore/rewards";
import { useFabAction } from "@/hooks/use-fab-action";
import { toast } from "sonner";
import { Users } from "lucide-react";
import type { Client, Reward } from "@/types";

export default function ClientesPage() {
  const { user, establishment, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Redeem states
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemRewardItem, setRedeemRewardItem] = useState<Reward | null>(null);
  const [redeemClient, setRedeemClient] = useState<Client | null>(null);

  const loadClients = useCallback(async () => {
    if (!establishment?.id) return;

    setLoading(true);
    try {
      const data = await searchClients(establishment.id, searchQuery);
      setClients(data);
    } catch (error) {
      console.error("Error loading clients:", error);
      toast.error("Error al cargar los clientes");
    } finally {
      setLoading(false);
    }
  }, [establishment?.id, searchQuery]);

  useEffect(() => {
    if (!authLoading && establishment) {
      loadClients();
    }
  }, [authLoading, establishment, loadClients]);

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setDetailsOpen(true);
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    setDeleting(true);
    try {
      await deleteClient(clientToDelete.id);
      toast.success("Cliente eliminado correctamente");
      setDeleteDialogOpen(false);
      setClientToDelete(null);
      loadClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Error al eliminar el cliente");
    } finally {
      setDeleting(false);
    }
  };

  const handleRedeemReward = (reward: Reward, client: Client) => {
    setRedeemRewardItem(reward);
    setRedeemClient(client);
    setRedeemOpen(true);
  };

  const handleRedeemConfirm = async () => {
    if (!redeemRewardItem || !redeemClient || !establishment || !user) return;

    const result = await redeemReward({
      rewardId: redeemRewardItem.id,
      clientId: redeemClient.id,
      establishmentId: establishment.id,
      createdBy: user.id,
    });

    if (result.success) {
      toast.success(`${redeemClient.name} canjeó: ${redeemRewardItem.name}`);
      setRedeemOpen(false);
      setRedeemRewardItem(null);
      setRedeemClient(null);
      setDetailsOpen(false);
      loadClients();
    } else {
      toast.error(result.error || "Error al procesar el canje");
    }
  };

  // FAB action for adding clients
  const openAddClient = useCallback(() => {
    // Currently the page doesn't have an add client dialog,
    // but the FAB action is wired for future use
  }, []);
  useFabAction("add-client", openAddClient);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Clientes</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gestiona los clientes de tu establecimiento
        </p>
      </div>

      {clients.length === 0 && !searchQuery ? (
        <EmptyState
          icon={Users}
          title="Sin clientes"
          description="Aún no tienes clientes registrados."
          action={
            <Button onClick={openAddClient}>Agregar cliente</Button>
          }
        />
      ) : (
        <ClientsTable
          clients={clients}
          establishment={establishment}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onViewClient={handleViewClient}
          onDeleteClient={handleDeleteClick}
        />
      )}

      <ClientDetailsDialog
        client={selectedClient}
        establishment={establishment}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onRedeemReward={handleRedeemReward}
      />

      <RedeemDialog
        open={redeemOpen}
        onOpenChange={setRedeemOpen}
        reward={redeemRewardItem}
        client={redeemClient}
        establishment={establishment}
        onConfirm={handleRedeemConfirm}
      />

      <ResponsiveDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Eliminar cliente</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Estas seguro de que deseas eliminar a {clientToDelete?.name}? Esta
              accion no se puede deshacer.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  );
}
