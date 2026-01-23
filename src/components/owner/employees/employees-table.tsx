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
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <UserCog className="h-5 w-5" />
          Empleados ({employees.length})
        </CardTitle>
        <Button onClick={onAdd} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo empleado
        </Button>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
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
          <>
            {/* Mobile: Card list */}
            <div className="space-y-3 sm:hidden">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{employee.name}</p>
                          {employee.phone && (
                            <p className="text-sm text-muted-foreground">{employee.phone}</p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
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
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge
                          variant={employee.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {employee.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      {employee.specialties.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {getServiceNames(employee.specialties)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead className="hidden md:table-cell">Contacto</TableHead>
                    <TableHead className="hidden lg:table-cell">Servicios</TableHead>
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
                      <TableCell className="hidden md:table-cell">
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
                      <TableCell className="hidden lg:table-cell">
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
