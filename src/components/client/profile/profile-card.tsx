"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Pencil, Mail, Phone, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import { formatClientCode } from "@/lib/utils";
import type { Client } from "@/types";

interface ProfileCardProps {
  client: Client;
  currencySymbol: string;
  currencyName: string;
  onEditPhone: () => void;
}

export function ProfileCard({
  client,
  currencySymbol,
  currencyName,
  onEditPhone,
}: ProfileCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(client.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* QR Code grande y código */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Tu Código de Cliente</CardTitle>
          <p className="text-sm text-muted-foreground">
            Muestra el QR o dicta tu código para ganar puntos
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-8 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <QRCodeSVG value={client.id} size={200} />
          </div>

          {/* Código alternativo */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">
              O usa tu código:
            </p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-mono font-bold tracking-wider">
                {formatClientCode(client.code)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyCode}
                className="h-8 w-8"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info del cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Mi Información</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-medium">{client.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{client.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{client.phone}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onEditPhone}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Balance actual</span>
              <span className="text-2xl font-bold text-primary">
                {client.balance} {currencySymbol}
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-right">
              {currencyName}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
