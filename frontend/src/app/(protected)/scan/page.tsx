"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ScanPage() {
    const [scanResult, setScanResult] = useState<string | null>(null)
    const router = useRouter()
    // Use a ref to prevent double initialization in Strict Mode
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)

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
                // Handle result logic: Redirect based on pattern
                // e.g. /crates/:qr or /items/:id?
                // Assume QR contains just the code. 
                // We might search backend for this QR.
                router.push(`/search?q=${encodeURIComponent(decodedText)}`)
            },
            (errorMessage) => {
                // parse error, ignore
            }
        )

        return () => {
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
                </div>
            )}
        </div>
    )
}
