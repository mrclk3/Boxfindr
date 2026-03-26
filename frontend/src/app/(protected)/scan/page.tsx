"use client";

import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // 1. Kamera sofort stoppen, sobald ein Code gefunden wurde
            if (html5QrCode.isScanning) {
              html5QrCode.stop().then(() => {
                
                // 2. Weiterleitung ausführen
                try {
                  // Fall A: Im QR-Code steht eine komplette URL (z.B. http://boxfindr.it-lab.cc/crates/1)
                  const url = new URL(decodedText);
                  router.push(url.pathname + url.search);
                } catch {
                  // Fall B: Im QR-Code steht nur ein relativer Pfad (z.B. /crates/1 oder /cabinets/5)
                  router.push(decodedText);
                }

              }).catch(console.error);
            }
          },
          (errorMessage) => {
            // Wird permanent aufgerufen, wenn gerade kein Code im Bild ist.
            // Ignorieren wir, um die Konsole nicht vollzuspammen.
          }
        );
      } catch (err) {
        console.error("Kamera konnte nicht gestartet werden:", err);
        setError("Bitte erlaube den Kamerazugriff in deinem Browser, um scannen zu können.");
      }
    };

    startScanner();

    // Cleanup: Kamera stoppen, wenn der Nutzer die Seite (z.B. über die Bottom-Nav) verlässt
    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center p-6 space-y-6">
      <h1 className="text-2xl font-bold">Scannen</h1>
      
      {error && (
        <div className="text-red-500 bg-red-50 p-3 rounded-md text-sm text-center">
          {error}
        </div>
      )}

      <div 
        id="reader" 
        className="w-full max-w-sm overflow-hidden rounded-xl shadow-lg border-2 border-dashed border-gray-300 bg-black"
      ></div>
      
      <p className="text-sm text-gray-500 text-center">
        Halte die Kamera auf den QR-Code einer Kiste oder eines Regals.
      </p>
    </div>
  );
}