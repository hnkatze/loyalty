"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Pencil, Trash2, UserCog, Plus, Clock } from "lucide-react";
import type { Employee, Service } from "@/types";

interface EmployeesTableProps {
  employees: Employee[];
  services: Service[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onEditAvailability: (employee: Employee) => void;
  onAdd: () => void;
}

export function EmployeesTable({
  employees,
  services,
  onEdit,
  onDelete,
  onEditAvailability,
  onAdd,
}: EmployeesTableProps) {
  const getServiceNames = (specialties: string[]) => {
    if (specialties.length === 0) return "Sin servicios asignados";
    return specialties
      .map((id) => services.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          Empleados ({employees.length})
        </CardTitle>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo empleado
        </Button>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <div className="text-center py-8">
            <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No hay empleados registrados aún
            </p>
            <p className="text-sm text-muted-foreground">
              Agrega empleados para asignarles servicios y disponibilidad
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{employee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {employee.phone && <p>{employee.phone}</p>}
                      {employee.email && (
                        <p className="text-muted-foreground">{employee.email}</p>
                      )}
                      {!employee.phone && !employee.email && (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
                      {getServiceNames(employee.specialties)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={employee.isActive ? "default" : "secondary"}>
                      {employee.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(employee)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditAvailability(employee)}>
                          <Clock className="mr-2 h-4 w-4" />
                          Disponibilidad
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(employee)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
