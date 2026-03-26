"use client";

import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Ref, um sich den zuletzt gescannten Code kurz zu merken (verhindert Popup-Spam)
  const lastScannedRef = useRef<string | null>(null);

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
            // 1. Wenn dieser Code gerade erst gescannt und blockiert wurde, ignorieren wir ihn
            if (lastScannedRef.current === decodedText) return;

            // 2. Pfad extrahieren
            let targetPath = "";
            try {
              const url = new URL(decodedText);
              targetPath = url.pathname + url.search;
            } catch {
              targetPath = decodedText;
            }

            // 3. Prüfen, ob der Pfad zu unserem System gehört
            const isSystemCode = targetPath.startsWith('/crates/') || 
                                 targetPath.startsWith('/cabinets/') || 
                                 targetPath.startsWith('/items/');

            // 4. Fall: Fremder QR-Code
            if (!isSystemCode) {
              lastScannedRef.current = decodedText; // Code merken
              window.alert("Dieser QR-Code gehört nicht zum System (Kiste/Schrank nicht gefunden).");
              
              // Nach 3 Sekunden vergessen wir den Code wieder, falls er nochmal gescannt werden soll
              setTimeout(() => { lastScannedRef.current = null; }, 3000);
              return; // Hier brechen wir ab, der Scanner läuft im Hintergrund weiter!
            }

            // 5. Fall: Gültiger System-Code -> Kamera stoppen und weiterleiten
            if (html5QrCode.isScanning) {
              html5QrCode.stop().then(() => {
                router.push(targetPath);
              }).catch(console.error);
            }
          },
          (errorMessage) => {
            // Wird permanent aufgerufen, ignorieren wir.
          }
        );
      } catch (err) {
        console.error("Kamera konnte nicht gestartet werden:", err);
        setError("Bitte erlaube den Kamerazugriff in deinem Browser, um scannen zu können.");
      }
    };

    startScanner();

    // Cleanup
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