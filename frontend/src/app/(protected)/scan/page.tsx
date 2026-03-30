"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { fetchClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle } from 'lucide-react';

type ScanMode = 'idle' | 'move-target';

interface ScannedItem {
  id: number;
  name: string;
  quantity: number;
  crate?: {
    number: string;
    cabinet?: { number: string } | null;
  } | null;
}

type ScanTelemetryEvent = {
  eventType: string;
  entityType: string;
  entityId?: number;
  qrPayload?: string;
  status: string;
  errorMessage?: string;
};

function parseEntityPath(raw: string): { entity: 'item' | 'crate' | 'cabinet' | null; id: number | null } {
  let path = raw;
  let searchParams: URLSearchParams | null = null;
  try {
    const asUrl = new URL(raw);
    path = asUrl.pathname;
    searchParams = asUrl.searchParams;
  } catch {
    path = raw.split('?')[0];
    const query = raw.includes('?') ? raw.split('?')[1] : '';
    searchParams = new URLSearchParams(query);
  }

  if (path === '/scan' && searchParams?.get('itemId')) {
    const itemId = Number(searchParams.get('itemId'));
    if (Number.isFinite(itemId) && itemId > 0) {
      return { entity: 'item', id: itemId };
    }
  }

  const itemMatch = path.match(/^\/items\/(\d+)$/);
  if (itemMatch) return { entity: 'item', id: Number(itemMatch[1]) };

  const crateMatch = path.match(/^\/crates\/(\d+)$/);
  if (crateMatch) return { entity: 'crate', id: Number(crateMatch[1]) };

  const cabinetMatch = path.match(/^\/cabinets\/(\d+)$/);
  if (cabinetMatch) return { entity: 'cabinet', id: Number(cabinetMatch[1]) };

  return { entity: null, id: null };
}

export default function ScanPage() {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Scanne einen Item-QR-Code, um direkt eine Aktion zu starten.');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [scanMode, setScanMode] = useState<ScanMode>('idle');
  const [activeItem, setActiveItem] = useState<ScannedItem | null>(null);
  const [amount, setAmount] = useState<string>('1');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [suppressItemIdAutoload, setSuppressItemIdAutoload] = useState(false);
  
  // Ref, um sich den zuletzt gescannten Code kurz zu merken (verhindert Popup-Spam)
  const lastScannedRef = useRef<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isLoadingLinkedItem, setIsLoadingLinkedItem] = useState(false);

  const safeAmount = Math.max(1, Number.parseInt(amount, 10) || 1);

  const sendScanTelemetry = async (event: ScanTelemetryEvent) => {
    try {
      await fetchClient('/monitoring/scan-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch {
      // Best-effort telemetry only.
    }
  };

  const loadItem = async (itemId: number): Promise<boolean> => {
    try {
      setBusy(true);
      const res = await fetchClient(`/items/${itemId}`);
      if (!res.ok) throw new Error('Item konnte nicht geladen werden.');
      const data = await res.json();
      setActiveItem({
        id: data.id,
        name: data.name,
        quantity: data.quantity,
        crate: data.crate,
      });
      setScanMode('idle');
      setStatusType('info');
      setStatus('Aktion wählen: Einlagern, Ausbuchen oder Umlagern.');
      return true;
    } catch (e) {
      setStatusType('error');
      setStatus('Item konnte nicht geladen werden. Bitte erneut scannen.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const applyStockChange = async (change: number) => {
    if (!activeItem || busy) return;
    setBusy(true);
    try {
      const res = await fetchClient(`/items/${activeItem.id}/quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.detail || 'Bestand konnte nicht aktualisiert werden.');
      }

      const updated = await res.json();
      setActiveItem((prev: ScannedItem | null) => prev ? { ...prev, quantity: updated.quantity } : prev);
      setStatusType('success');
      setStatus(change > 0 ? '✓ Erfolgreich eingelagert.' : '✓ Erfolgreich ausgebucht.');
    } catch (e: any) {
      setStatusType('error');
      setStatus(e?.message || 'Aktion fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  };

  const startMoveFlow = () => {
    if (!activeItem) return;
    setScanMode('move-target');
    setStatusType('info');
    setStatus('Jetzt Ziel-Kisten-QR scannen, um umzulagern.');
  };

  const executeMove = async (targetCrateId: number) => {
    if (!activeItem || busy) return;
    setBusy(true);
    try {
      const res = await fetchClient(`/items/${activeItem.id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCrateId }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.detail || 'Umlagern fehlgeschlagen.');
      }

      await loadItem(activeItem.id);
      setStatusType('success');
      setStatus('✓ Umlagern erfolgreich.');
    } catch (e: any) {
      setStatusType('error');
      setStatus(e?.message || 'Umlagern fehlgeschlagen.');
    } finally {
      setScanMode('idle');
      setBusy(false);
    }
  };

  useEffect(() => {
    const itemIdParam = searchParams.get('itemId');
    const itemId = Number(itemIdParam);

    if (!itemIdParam) {
      if (suppressItemIdAutoload) {
        setSuppressItemIdAutoload(false);
      }
      return;
    }

    if (suppressItemIdAutoload) {
      return;
    }

    if (!itemIdParam || !Number.isFinite(itemId) || itemId <= 0) {
      return;
    }
    if (activeItem?.id === itemId) {
      return;
    }

    let cancelled = false;
    const loadWithRetry = async () => {
      setIsLoadingLinkedItem(true);
      setStatusType('info');
      setStatus('Lade gescanntes Item...');

      for (let attempt = 1; attempt <= 3; attempt++) {
        if (cancelled) return;
        const ok = await loadItem(itemId);
        if (ok || cancelled) {
          setIsLoadingLinkedItem(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      if (!cancelled) {
        setIsLoadingLinkedItem(false);
      }
    };

    void loadWithRetry();

    return () => {
      cancelled = true;
    };
  }, [searchParams, activeItem?.id, suppressItemIdAutoload]);

  const shouldRunScanner = !activeItem && !searchParams.get('itemId') && !isLoadingLinkedItem;

  useEffect(() => {
    if (!shouldRunScanner) {
      return;
    }

    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

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

            const { entity, id } = parseEntityPath(decodedText);
            if (!entity || !id) {
              lastScannedRef.current = decodedText;
              setStatusType('error');
              setStatus('Dieser QR-Code gehört nicht zu Boxfindr.');
              void sendScanTelemetry({
                eventType: 'scan_invalid_qr',
                entityType: 'unknown',
                qrPayload: decodedText,
                status: 'failed_invalid_qr',
                errorMessage: 'QR code is not part of Boxfindr.',
              });
              setTimeout(() => { lastScannedRef.current = null; }, 2500);
              return;
            }

            // Kurze Sperre für Double-Scans
            lastScannedRef.current = decodedText;
            setTimeout(() => { lastScannedRef.current = null; }, 1200);

            if (scanMode === 'move-target') {
              if (entity === 'crate') {
                void sendScanTelemetry({
                  eventType: 'scan_move_target',
                  entityType: 'crate',
                  entityId: id,
                  qrPayload: decodedText,
                  status: 'success',
                });
                void executeMove(id);
                return;
              }

              if (entity === 'cabinet') {
                setStatusType('error');
                setStatus('Bitte eine Kiste scannen, nicht den Schrank.');
                void sendScanTelemetry({
                  eventType: 'scan_move_target',
                  entityType: 'cabinet',
                  entityId: id,
                  qrPayload: decodedText,
                  status: 'failed_wrong_target',
                  errorMessage: 'Expected crate QR while moving item.',
                });
                return;
              }

              if (entity === 'item') {
                void loadItem(id);
                return;
              }
            }

            if (entity === 'item') {
              void sendScanTelemetry({
                eventType: 'scan_item',
                entityType: 'item',
                entityId: id,
                qrPayload: decodedText,
                status: 'success',
              });
              void loadItem(id);
              return;
            }

            // Für crate/cabinet weiterhin direkt navigieren.
            const targetPath = entity === 'crate' ? `/crates/${id}` : `/cabinets/${id}`;
            if (html5QrCode.isScanning) {
              html5QrCode.stop().then(() => router.push(targetPath)).catch(console.error);
            }
          },
          (_errorMessage) => {
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
      scannerRef.current = null;
    };
  }, [router, scanMode, shouldRunScanner]);

  const resetFlow = () => {
    setSuppressItemIdAutoload(true);
    setActiveItem(null);
    setScanMode('idle');
    setAmount('1');
    setStatusType('info');
    setStatus('Scanne einen Item-QR-Code, um direkt eine Aktion zu starten.');

    // Prevent immediate dialog reopen when page was opened via /scan?itemId=...
    if (searchParams.get('itemId')) {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete('itemId');
      const nextQuery = nextParams.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    }
  };

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

      {isLoadingLinkedItem && (
        <div className="w-full max-w-sm rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">
          Gescanntes Item wird geladen...
        </div>
      )}

      <p className="text-sm text-gray-500 text-center">
        Halte die Kamera auf den QR-Code. Das Aktionsmenü erscheint automatisch.
      </p>

      {/* Dialog Modal für Aktionen */}
      <Dialog open={!!activeItem} onOpenChange={(open: boolean) => { if (!open) resetFlow(); }}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">{activeItem?.name}</DialogTitle>
            <DialogDescription className="text-center">
              {activeItem && `Bestand: ${activeItem.quantity} | Ort: Cabinet ${activeItem.crate?.cabinet?.number || '?'} / Crate ${activeItem.crate?.number || '?'}`}
            </DialogDescription>
          </DialogHeader>

          {/* Status-Nachricht */}
          {status && (
            <div
              className={`flex items-start gap-2 p-3 rounded-md text-sm ${
                statusType === 'success'
                  ? 'bg-green-50 text-green-800'
                  : statusType === 'error'
                    ? 'bg-red-50 text-red-800'
                    : 'bg-blue-50 text-blue-800'
              }`}
            >
              {statusType === 'success' && <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
              {statusType === 'error' && <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
              <span>{status}</span>
            </div>
          )}

          {/* Menge-Input (nur wenn idle, nicht beim Umlagern) */}
          {scanMode === 'idle' && (
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="modal-amount">
                Menge
              </label>
              <Input
                id="modal-amount"
                type="number"
                min={1}
                step={1}
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                disabled={busy}
              />
            </div>
          )}

          {/* Aktions-Buttons */}
          {scanMode === 'idle' && (
            <div className="grid grid-cols-1 gap-2">
              <Button
                size="lg"
                className="font-bold"
                disabled={busy}
                onClick={() => applyStockChange(safeAmount)}
              >
                ➕ Einlagern (+{safeAmount})
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="font-bold"
                disabled={busy}
                onClick={() => applyStockChange(-safeAmount)}
              >
                ➖ Ausbuchen (-{safeAmount})
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-bold"
                disabled={busy}
                onClick={startMoveFlow}
              >
                🔄 Umlagern (Ziel scannen)
              </Button>
            </div>
          )}

          {/* Im Move-Modus */}
          {scanMode === 'move-target' && (
            <div className="text-center text-sm text-muted-foreground">
              Bitte Ziel-Kisten-QR scannen...
            </div>
          )}

          {/* Schließen/Reset Button */}
          <Button
            variant="ghost"
            className="w-full"
            onClick={resetFlow}
            disabled={busy}
          >
            Neues Item scannen
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}