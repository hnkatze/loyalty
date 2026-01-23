"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  RewardsTable,
  RewardFormDialog,
  RedeemDialog,
} from "@/components/owner/rewards";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  getRewardsByEstablishment,
  createReward,
  updateReward,
  deleteReward,
  redeemReward,
} from "@/lib/firebase/firestore/rewards";
import { searchClients } from "@/lib/firebase/firestore/clients";
import { toast } from "sonner";
import { Gift } from "lucide-react";
import type { Reward, Client } from "@/types";

export default function RecompensasPage() {
  const { user, establishment, loading: authLoading } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState<Reward | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Redeem states
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemRewardItem, setRedeemRewardItem] = useState<Reward | null>(null);
  const [redeemClient, setRedeemClient] = useState<Client | null>(null);

  const loadRewards = useCallback(async () => {
    if (!establishment?.id) return;

    setLoading(true);
    try {
      const data = await getRewardsByEstablishment(establishment.id);
      setRewards(data);
    } catch (error) {
      console.error("Error loading rewards:", error);
      toast.error("Error al cargar las recompensas");
    } finally {
      setLoading(false);
    }
  }, [establishment?.id]);

  useEffect(() => {
    if (!authLoading && establishment) {
      loadRewards();
    }
  }, [authLoading, establishment, loadRewards]);

  const handleAddReward = () => {
    setSelectedReward(null);
    setFormOpen(true);
  };

  const handleEditReward = (reward: Reward) => {
    setSelectedReward(reward);
    setFormOpen(true);
  };

  const handleDeleteClick = (reward: Reward) => {
    setRewardToDelete(reward);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: {
    name: string;
    description: string;
    cost: number;
    isActive: boolean;
  }) => {
    if (!establishment?.id) return;

    try {
      if (selectedReward) {
        await updateReward(selectedReward.id, data);
        toast.success("Recompensa actualizada");
      } else {
        await createReward({
          establishmentId: establishment.id,
          name: data.name,
          description: data.description || undefined,
          cost: data.cost,
        });
        toast.success("Recompensa creada");
      }
      loadRewards();
    } catch (error) {
      console.error("Error saving reward:", error);
      toast.error("Error al guardar la recompensa");
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!rewardToDelete) return;

    setDeleting(true);
    try {
      await deleteReward(rewardToDelete.id);
      toast.success("Recompensa eliminada");
      setDeleteDialogOpen(false);
      setRewardToDelete(null);
      loadRewards();
    } catch (error) {
      console.error("Error deleting reward:", error);
      toast.error("Error al eliminar la recompensa");
    } finally {
      setDeleting(false);
    }
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
      loadRewards();
    } else {
      toast.error(result.error || "Error al procesar el canje");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Gift className="h-8 w-8" />
          Recompensas
        </h1>
        <p className="text-muted-foreground">
          Gestiona las recompensas que tus clientes pueden canjear con sus{" "}
          {establishment?.currencyName.toLowerCase()}
        </p>
      </div>

      <RewardsTable
        rewards={rewards}
        establishment={establishment}
        onEdit={handleEditReward}
        onDelete={handleDeleteClick}
        onAdd={handleAddReward}
      />

      <RewardFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        reward={selectedReward}
        establishment={establishment}
        onSubmit={handleFormSubmit}
      />

      <RedeemDialog
        open={redeemOpen}
        onOpenChange={setRedeemOpen}
        reward={redeemRewardItem}
        client={redeemClient}
        establishment={establishment}
        onConfirm={handleRedeemConfirm}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar recompensa</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar "{rewardToDelete?.name}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
