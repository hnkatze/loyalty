"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ServicesTable, ServiceFormDialog } from "@/components/owner/services";
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
  getServicesByEstablishment,
  createService,
  updateService,
  deleteService,
} from "@/lib/firebase/firestore/services";
import { toast } from "sonner";
import { Scissors } from "lucide-react";
import type { Service } from "@/types";

export default function ServiciosPage() {
  const { establishment, loading: authLoading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadServices = useCallback(async () => {
    if (!establishment?.id) return;

    setLoading(true);
    try {
      const data = await getServicesByEstablishment(establishment.id);
      setServices(data);
    } catch (error) {
      console.error("Error loading services:", error);
      toast.error("Error al cargar los servicios");
    } finally {
      setLoading(false);
    }
  }, [establishment?.id]);

  useEffect(() => {
    if (!authLoading && establishment) {
      loadServices();
    }
  }, [authLoading, establishment, loadServices]);

  const handleAddService = () => {
    setSelectedService(null);
    setFormOpen(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setFormOpen(true);
  };

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: {
    name: string;
    description: string;
    duration: number;
    price: number | undefined;
    isActive: boolean;
  }) => {
    if (!establishment?.id) return;

    try {
      if (selectedService) {
        await updateService(selectedService.id, {
          name: data.name,
          description: data.description || undefined,
          duration: data.duration,
          price: data.price,
          isActive: data.isActive,
        });
        toast.success("Servicio actualizado");
      } else {
        await createService({
          establishmentId: establishment.id,
          name: data.name,
          description: data.description || undefined,
          duration: data.duration,
          price: data.price,
        });
        toast.success("Servicio creado");
      }
      loadServices();
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Error al guardar el servicio");
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    setDeleting(true);
    try {
      await deleteService(serviceToDelete.id);
      toast.success("Servicio eliminado");
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
      loadServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Error al eliminar el servicio");
    } finally {
      setDeleting(false);
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
          <Scissors className="h-8 w-8" />
          Servicios
        </h1>
        <p className="text-muted-foreground">
          Gestiona los servicios que ofrece tu establecimiento
        </p>
      </div>

      <ServicesTable
        services={services}
        onEdit={handleEditService}
        onDelete={handleDeleteClick}
        onAdd={handleAddService}
      />

      <ServiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        service={selectedService}
        onSubmit={handleFormSubmit}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar servicio</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar "{serviceToDelete?.name}"?
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
