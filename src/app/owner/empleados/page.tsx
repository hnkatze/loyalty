"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  EmployeesTable,
  EmployeeFormDialog,
  EmployeeAvailabilityForm,
} from "@/components/owner/employees";
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
  getEmployeesByEstablishment,
  createEmployee,
  updateEmployee,
  updateEmployeeAvailability,
  deleteEmployee,
} from "@/lib/firebase/firestore/employees";
import { getServicesByEstablishment } from "@/lib/firebase/firestore/services";
import { useFabAction } from "@/hooks/use-fab-action";
import { toast } from "sonner";
import { UserCog } from "lucide-react";
import type { Employee, Service, EmployeeAvailability } from "@/types";

export default function EmpleadosPage() {
  const { establishment, loading: authLoading } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [availabilityEmployee, setAvailabilityEmployee] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!establishment?.id) return;

    setLoading(true);
    try {
      const [employeesData, servicesData] = await Promise.all([
        getEmployeesByEstablishment(establishment.id),
        getServicesByEstablishment(establishment.id),
      ]);
      setEmployees(employeesData);
      setServices(servicesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }, [establishment?.id]);

  useEffect(() => {
    if (!authLoading && establishment) {
      loadData();
    }
  }, [authLoading, establishment, loadData]);

  const handleAddEmployee = useCallback(() => {
    setSelectedEmployee(null);
    setFormOpen(true);
  }, []);

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormOpen(true);
  };

  const handleEditAvailability = (employee: Employee) => {
    setAvailabilityEmployee(employee);
    setAvailabilityOpen(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: {
    name: string;
    phone: string;
    email: string;
    specialties: string[];
    isActive: boolean;
  }) => {
    if (!establishment?.id) return;

    try {
      if (selectedEmployee) {
        await updateEmployee(selectedEmployee.id, {
          name: data.name,
          phone: data.phone || undefined,
          email: data.email || undefined,
          specialties: data.specialties,
          isActive: data.isActive,
        });
        toast.success("Empleado actualizado");
      } else {
        await createEmployee({
          establishmentId: establishment.id,
          name: data.name,
          phone: data.phone || undefined,
          email: data.email || undefined,
          specialties: data.specialties,
        });
        toast.success("Empleado creado");
      }
      loadData();
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error("Error al guardar el empleado");
      throw error;
    }
  };

  const handleAvailabilitySubmit = async (availability: EmployeeAvailability) => {
    if (!availabilityEmployee) return;

    try {
      await updateEmployeeAvailability(availabilityEmployee.id, availability);
      toast.success("Disponibilidad actualizada");
      loadData();
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Error al actualizar la disponibilidad");
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    setDeleting(true);
    try {
      await deleteEmployee(employeeToDelete.id);
      toast.success("Empleado eliminado");
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      loadData();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Error al eliminar el empleado");
    } finally {
      setDeleting(false);
    }
  };

  // FAB action
  useFabAction("add-employee", handleAddEmployee);

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
        <h1 className="text-xl font-bold md:text-2xl flex items-center gap-2">
          <UserCog className="h-5 w-5 md:h-6 md:w-6" />
          Empleados
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gestiona los empleados de tu establecimiento y su disponibilidad
        </p>
      </div>

      {employees.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="Sin empleados"
          description="Aún no has agregado empleados."
          action={
            <Button onClick={handleAddEmployee}>Agregar empleado</Button>
          }
        />
      ) : (
        <EmployeesTable
          employees={employees}
          services={services}
          onEdit={handleEditEmployee}
          onDelete={handleDeleteClick}
          onEditAvailability={handleEditAvailability}
          onAdd={handleAddEmployee}
        />
      )}

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={selectedEmployee}
        services={services}
        onSubmit={handleFormSubmit}
      />

      <EmployeeAvailabilityForm
        open={availabilityOpen}
        onOpenChange={setAvailabilityOpen}
        employee={availabilityEmployee}
        onSubmit={handleAvailabilitySubmit}
      />

      <ResponsiveDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Eliminar empleado</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              ¿Estás seguro de que deseas eliminar a &quot;{employeeToDelete?.name}&quot;?
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
