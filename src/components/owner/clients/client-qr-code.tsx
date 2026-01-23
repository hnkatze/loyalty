"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Client } from "@/types";

interface ClientQRCodeProps {
  client: Client;
  size?: number;
}

export function ClientQRCode({ client, size = 200 }: ClientQRCodeProps) {
  // El QR contiene el ID del cliente
  const qrData = JSON.stringify({
    clientId: client.id,
    type: "loyalty-client",
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-center">
          Codigo QR
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2">
        <div className="bg-white p-4 rounded-lg">
          <QRCodeSVG
            value={qrData}
            size={size}
            level="H"
            includeMargin={false}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Muestra este codigo para recibir puntos
        </p>
      </CardContent>
    </Card>
  );
}
