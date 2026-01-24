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
import { MoreHorizontal, Pencil, Trash2, Gift, Plus } from "lucide-react";
import type { Reward, Establishment } from "@/types";

interface RewardsTableProps {
  rewards: Reward[];
  establishment: Establishment | null;
  onEdit: (reward: Reward) => void;
  onDelete: (reward: Reward) => void;
  onAdd: () => void;
}

export function RewardsTable({
  rewards,
  establishment,
  onEdit,
  onDelete,
  onAdd,
}: RewardsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
          Recompensas ({rewards.length})
        </CardTitle>
        <Button onClick={onAdd} className="w-full sm:w-auto" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nueva recompensa
        </Button>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
        {rewards.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <Gift className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-muted-foreground">
              No hay recompensas creadas aún
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Crea tu primera recompensa para que tus clientes puedan canjear
              sus {establishment?.currencyName.toLowerCase()}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: Card view */}
            <div className="space-y-3 sm:hidden">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{reward.name}</p>
                      {reward.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {reward.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(reward)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(reward)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-primary">
                        {establishment?.currencySymbol} {reward.cost}
                      </span>
                      <span className="text-muted-foreground">
                        {reward.redemptionCount} canjes
                      </span>
                    </div>
                    <Badge
                      variant={reward.isActive ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {reward.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table view */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Costo</TableHead>
                    <TableHead className="hidden md:table-cell">Canjes</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards.map((reward) => (
                    <TableRow key={reward.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reward.name}</p>
                          {reward.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {reward.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {establishment?.currencySymbol} {reward.cost}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {reward.redemptionCount}
                      </TableCell>
                      <TableCell>
                        <Badge variant={reward.isActive ? "default" : "secondary"}>
                          {reward.isActive ? "Activa" : "Inactiva"}
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
                            <DropdownMenuItem onClick={() => onEdit(reward)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDelete(reward)}
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
