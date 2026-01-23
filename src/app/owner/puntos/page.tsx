"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { QRScanner, PointsForm } from "@/components/owner/qr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClient, getClientByCode } from "@/lib/firebase/firestore/clients";
import { updateClientBalance } from "@/lib/firebase/firestore/clients";
import { createTransaction } from "@/lib/firebase/firestore/transactions";
import { toast } from "sonner";
import { QrCode, History, CheckCircle, Keyboard } from "lucide-react";
import type { Client } from "@/types";

type PageState = "scanning" | "form" | "success";

interface RecentScan {
  client: Client;
  points: number;
  timestamp: Date;
}

export default function PuntosPage() {
  const { user, establishment, loading: authLoading } = useAuth();
  const [pageState, setPageState] = useState<PageState>("scanning");
  const [scannedClient, setScannedClient] = useState<Client | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [inputMode, setInputMode] = useState<"qr" | "code">("qr");
  const [codeInput, setCodeInput] = useState("");
  const [searchingCode, setSearchingCode] = useState(false);

  const handleScan = async (data: { clientId: string }) => {
    try {
      const client = await getClient(data.clientId);

      if (!client) {
        toast.error("Cliente no encontrado");
        return;
      }

      if (client.establishmentId !== establishment?.id) {
        toast.error("Este cliente no pertenece a tu establecimiento");
        return;
      }

      setScannedClient(client);
      setPageState("form");
    } catch (error) {
      console.error("Error getting client:", error);
      toast.error("Error al obtener datos del cliente");
    }
  };

  const handleCodeSearch = async () => {
    if (!codeInput.trim() || !establishment) return;

    setSearchingCode(true);
    try {
      const client = await getClientByCode(establishment.id, codeInput);

      if (!client) {
        toast.error("Código no encontrado");
        return;
      }

      setScannedClient(client);
      setPageState("form");
      setCodeInput("");
    } catch (error) {
      console.error("Error searching client by code:", error);
      toast.error("Error al buscar cliente");
    } finally {
      setSearchingCode(false);
    }
  };

  const handleSubmitPoints = async (points: number, notes: string) => {
    if (!scannedClient || !establishment || !user) return;

    try {
      const newBalance = scannedClient.balance + points;

      // Actualizar balance del cliente
      await updateClientBalance(scannedClient.id, newBalance);

      // Crear transaccion
      await createTransaction({
        establishmentId: establishment.id,
        clientId: scannedClient.id,
        type: "earned",
        amount: points,
        notes: notes || undefined,
        createdBy: user.id,
      });

      // Agregar a recientes
      setRecentScans((prev) => [
        {
          client: { ...scannedClient, balance: newBalance },
          points,
          timestamp: new Date(),
        },
        ...prev.slice(0, 4),
      ]);

      toast.success(
        `${points} ${establishment.currencyName} otorgados a ${scannedClient.name}`
      );

      setPageState("success");

      // Volver al scanner despues de 2 segundos
      setTimeout(() => {
        setPageState("scanning");
        setScannedClient(null);
      }, 2000);
    } catch (error) {
      console.error("Error submitting points:", error);
      toast.error("Error al otorgar puntos");
    }
  };

  const handleCancel = () => {
    setPageState("scanning");
    setScannedClient(null);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          No se encontro el establecimiento.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <QrCode className="h-8 w-8" />
          Otorgar Puntos
        </h1>
        <p className="text-muted-foreground">
          Escanea el código QR o ingresa el código del cliente
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          {pageState === "scanning" && (
            <div className="space-y-4">
              {/* Selector de modo */}
              <div className="flex gap-2">
                <Button
                  variant={inputMode === "qr" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInputMode("qr")}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Escanear QR
                </Button>
                <Button
                  variant={inputMode === "code" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInputMode("code")}
                >
                  <Keyboard className="h-4 w-4 mr-2" />
                  Ingresar código
                </Button>
              </div>

              {/* Contenido según modo */}
              {inputMode === "qr" ? (
                <QRScanner onScan={handleScan} onError={(err) => toast.error(err)} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Buscar por código</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="clientCode">Código del cliente</Label>
                        <Input
                          id="clientCode"
                          placeholder="Ej: ABC-123"
                          value={codeInput}
                          onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCodeSearch();
                          }}
                          className="text-2xl font-mono text-center tracking-wider"
                          maxLength={7}
                        />
                        <p className="text-xs text-muted-foreground text-center">
                          Ingresa el código de 6 caracteres (con o sin guión)
                        </p>
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleCodeSearch}
                        disabled={!codeInput.trim() || searchingCode}
                      >
                        {searchingCode ? "Buscando..." : "Buscar cliente"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {pageState === "form" && scannedClient && (
            <PointsForm
              client={scannedClient}
              establishment={establishment}
              onSubmit={handleSubmitPoints}
              onCancel={handleCancel}
            />
          )}

          {pageState === "success" && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <p className="text-xl font-semibold">Puntos otorgados</p>
                <p className="text-muted-foreground">
                  Escaneando siguiente cliente...
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Escaneos recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentScans.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay escaneos recientes
                </p>
              ) : (
                <div className="space-y-3">
                  {recentScans.map((scan, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{scan.client.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {scan.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="text-green-600 font-semibold">
                        +{establishment.currencySymbol} {scan.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
