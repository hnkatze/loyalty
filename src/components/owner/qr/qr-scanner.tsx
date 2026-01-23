"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, RotateCcw } from "lucide-react";

interface QRScannerProps {
  onScan: (data: { clientId: string }) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanning = async () => {
    if (!containerRef.current) return;

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            if (data.type === "loyalty-client" && data.clientId) {
              stopScanning();
              onScan({ clientId: data.clientId });
            }
          } catch {
            // QR no valido, continuar escaneando
          }
        },
        () => {
          // Error de escaneo, ignorar
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      setHasCamera(false);
      onError?.("No se pudo acceder a la camara");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
  };

  const resetScanner = () => {
    stopScanning();
    setTimeout(() => {
      startScanning();
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Scanner QR</span>
          {isScanning && (
            <Button variant="ghost" size="icon" onClick={resetScanner}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          ref={containerRef}
          id="qr-reader"
          className="w-full max-w-sm mx-auto overflow-hidden rounded-lg bg-muted"
          style={{ minHeight: isScanning ? "300px" : "200px" }}
        >
          {!isScanning && (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              {hasCamera ? (
                <>
                  <Camera className="h-12 w-12 mb-2" />
                  <p className="text-sm">Presiona iniciar para escanear</p>
                </>
              ) : (
                <>
                  <CameraOff className="h-12 w-12 mb-2" />
                  <p className="text-sm">Camara no disponible</p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center">
          {isScanning ? (
            <Button variant="outline" onClick={stopScanning}>
              <CameraOff className="mr-2 h-4 w-4" />
              Detener
            </Button>
          ) : (
            <Button onClick={startScanning} disabled={!hasCamera}>
              <Camera className="mr-2 h-4 w-4" />
              Iniciar scanner
            </Button>
          )}
        </div>

        {isScanning && (
          <p className="text-sm text-center text-muted-foreground">
            Apunta la camara al codigo QR del cliente
          </p>
        )}
      </CardContent>
    </Card>
  );
}
