"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchClient } from "@/lib/api"

export default function ScanPage() {
    const [scanResult, setScanResult] = useState<string | null>(null)
    const [statusMessage, setStatusMessage] = useState<string>("Kamera wird gestartet...")
    const router = useRouter()
    // Use a ref to prevent double initialization in Strict Mode
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)
    const hasNavigatedRef = useRef(false)

    const resolveQrAndNavigate = async (qrValue: string) => {
        if (hasNavigatedRef.current) {
            return
        }

        setStatusMessage("QR erkannt. Suche nach Kiste...")

        try {
            const crateResponse = await fetchClient(`/crates/by-qr/${encodeURIComponent(qrValue)}`)
            if (crateResponse.ok) {
                const crate = await crateResponse.json()
                hasNavigatedRef.current = true
                setStatusMessage(`Kiste ${crate.number} gefunden. Öffne...`)
                router.push(`/crates/${crate.id}`)
                return
            }

            setStatusMessage("Keine Kiste gefunden. Suche nach Schrank...")
            const cabinetResponse = await fetchClient(`/cabinets/by-qr/${encodeURIComponent(qrValue)}`)
            if (cabinetResponse.ok) {
                const cabinet = await cabinetResponse.json()
                hasNavigatedRef.current = true
                setStatusMessage(`Schrank ${cabinet.number} gefunden. Öffne...`)
                router.push(`/cabinets/${cabinet.id}`)
                return
            }

            setStatusMessage("QR-Code nicht gefunden.")
        } catch (error) {
            console.error("QR resolve failed", error)
            setStatusMessage("Backend nicht erreichbar.")
        }
    }

    useEffect(() => {
        // Check if element exists
        if (!document.getElementById("reader")) return;

        // Destroy previous instance if any (cleanup)
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
        }

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
        )
        scannerRef.current = scanner;

        scanner.render(
            (decodedText) => {
                setScanResult(decodedText)
                scanner.clear()
                resolveQrAndNavigate(decodedText)
            },
            (errorMessage) => {
                // parse error, ignore
            }
        )

        return () => {
            hasNavigatedRef.current = false
            if (scannerRef.current) {
                scannerRef.current.clear().catch((error) => console.error("Failed to clear html5-qrcode", error));
            }
        }
    }, [router])

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-center">Scan QR Code</h1>
            <Card>
                <CardContent className="p-4">
                    {/* html5-qrcode renders here */}
                    <div id="reader" className="w-full"></div>
                </CardContent>
            </Card>
            {scanResult && (
                <div className="text-center">
                    <p>Scanned: {scanResult}</p>
                    <p className="text-sm text-muted-foreground">{statusMessage}</p>
                </div>
            )}
        </div>
    )
}
