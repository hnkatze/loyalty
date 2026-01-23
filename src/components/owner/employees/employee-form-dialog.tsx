"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import type { Employee, Service } from "@/types";

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  services: Service[];
  onSubmit: (data: {
    name: string;
    phone: string;
    email: string;
    specialties: string[];
    isActive: boolean;
  }) => Promise<void>;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  services,
  onSubmit,
}: EmployeeFormDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!employee;

  useEffect(() => {
    if (open) {
      if (employee) {
        setName(employee.name);
        setPhone(employee.phone || "");
        setEmail(employee.email || "");
        setSpecialties(employee.specialties || []);
        setIsActive(employee.isActive);
      } else {
        setName("");
        setPhone("");
        setEmail("");
        setSpecialties([]);
        setIsActive(true);
      }
    }
  }, [open, employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        phone,
        email,
        specialties,
        isActive,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSpecialty = (serviceId: string) => {
    setSpecialties((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const activeServices = services.filter((s) => s.isActive);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar empleado" : "Nuevo empleado"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 300 123 4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: juan@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Servicios que ofrece</Label>
            {activeServices.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No hay servicios activos. Crea servicios primero.
              </p>
            ) : (
              <div className="border rounded-lg p-3 space-y-2 max-h-[200px] overflow-y-auto">
                {activeServices.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={specialties.includes(service.id)}
                      onCheckedChange={() => toggleSpecialty(service.id)}
                    />
                    <label
                      htmlFor={`service-${service.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {service.name}
                      {service.duration && (
                        <span className="text-muted-foreground ml-2">
                          ({service.duration} min)
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Empleado activo</p>
                <p className="text-sm text-muted-foreground">
                  Puede recibir citas y estar disponible
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear empleado"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
