"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ServicesTable, ServiceFormDialog } from "@/components/owner/services";
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
import {
  getServicesByEstablishment,
  createService,
  updateService,
  deleteService,
} from "@/lib/firebase/firestore/services";
import { useFabAction } from "@/hooks/use-fab-action";
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

  const handleAddService = useCallback(() => {
    setSelectedService(null);
    setFormOpen(true);
  }, []);

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

  // FAB action
  useFabAction("add-service", handleAddService);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl flex items-center gap-2">
          <Scissors className="h-5 w-5 md:h-6 md:w-6" />
          Servicios
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gestiona los servicios que ofrece tu establecimiento
        </p>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="Sin servicios"
          description="Aún no has creado servicios."
          action={
            <Button onClick={handleAddService}>Crear servicio</Button>
          }
        />
      ) : (
        <ServicesTable
          services={services}
          onEdit={handleEditService}
          onDelete={handleDeleteClick}
          onAdd={handleAddService}
        />
      )}

      <ServiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        service={selectedService}
        onSubmit={handleFormSubmit}
      />

      <ResponsiveDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Eliminar servicio</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              ¿Estás seguro de que deseas eliminar &quot;{serviceToDelete?.name}&quot;?
              Esta acción no se puede deshacer.
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
