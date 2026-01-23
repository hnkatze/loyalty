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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Recompensas ({rewards.length})
        </CardTitle>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva recompensa
        </Button>
      </CardHeader>
      <CardContent>
        {rewards.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No hay recompensas creadas aún
            </p>
            <p className="text-sm text-muted-foreground">
              Crea tu primera recompensa para que tus clientes puedan canjear
              sus {establishment?.currencyName.toLowerCase()}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Canjes</TableHead>
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
                  <TableCell>{reward.redemptionCount}</TableCell>
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
        )}
      </CardContent>
    </Card>
  );
}
