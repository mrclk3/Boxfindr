"use client"

import { useEffect, useState } from "react"
import { fetchClient } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertTriangle, Gauge, HeartPulse, QrCode } from "lucide-react"

type SummaryResponse = {
    windowHours: number
    health: {
        status: "ok" | "degraded"
        database: "ok" | "error"
        service: string
    }
    requests: {
        total: number
        errors: number
        errorRatePercent: number
        slowCount: number
        avgDurationMs: number
        slowThresholdMs: number
    }
    scans: {
        failedCount: number
        recentFailed: Array<{
            id: number
            timestamp: string
            eventType: string
            entityType: string
            entityId: number | null
            status: string
            errorMessage: string | null
        }>
    }
    slowEndpoints: Array<{
        endpoint: string
        count: number
        avgDurationMs: number
    }>
}

export default function StatusPage() {
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [summary, setSummary] = useState<SummaryResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            setIsAdmin(false)
            setLoading(false)
            return
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]))
            if (payload.role === "ADMIN") {
                setIsAdmin(true)
            } else {
                setLoading(false)
            }
        } catch {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!isAdmin) return

        let active = true

        const loadSummary = async () => {
            try {
                const res = await fetchClient("/monitoring/summary")
                if (!res.ok) {
                    throw new Error("Statusdaten konnten nicht geladen werden.")
                }
                const data = await res.json()
                if (!active) return
                setSummary(data)
                setError(null)
                setLoading(false)
            } catch (err: any) {
                if (!active) return
                setError(err?.message || "Statusdaten konnten nicht geladen werden.")
                setLoading(false)
            }
        }

        loadSummary()
        const interval = window.setInterval(loadSummary, 30000)

        return () => {
            active = false
            window.clearInterval(interval)
        }
    }, [isAdmin])

    if (!isAdmin && !loading) {
        return <div className="p-8 text-center text-muted-foreground">Access Restricted (Admin Only)</div>
    }

    if (loading) {
        return (
            <div className="p-8">
                <Loader2 className="animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">System Status</h1>
                <p className="text-sm text-muted-foreground">Automatische Aktualisierung alle 30 Sekunden</p>
            </div>

            {error && (
                <Card className="border-red-300">
                    <CardContent className="pt-6 text-red-600">{error}</CardContent>
                </Card>
            )}

            {summary && (
                <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <HeartPulse className="h-4 w-4" /> Health
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-semibold">{summary.health.status.toUpperCase()}</div>
                                <p className="text-xs text-muted-foreground">DB: {summary.health.database}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" /> Error Rate (24h)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-semibold">{summary.requests.errorRatePercent}%</div>
                                <p className="text-xs text-muted-foreground">{summary.requests.errors} von {summary.requests.total} Requests</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Gauge className="h-4 w-4" /> Slow Requests (24h)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-semibold">{summary.requests.slowCount}</div>
                                <p className="text-xs text-muted-foreground">Schwelle: {summary.requests.slowThresholdMs}ms</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <QrCode className="h-4 w-4" /> Failed Scans (24h)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-semibold">{summary.scans.failedCount}</div>
                                <p className="text-xs text-muted-foreground">Scan-Fehler in den letzten {summary.windowHours}h</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Langsamste Endpoints</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {summary.slowEndpoints.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">Keine langsamen Endpoints im Zeitfenster.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {summary.slowEndpoints.map((row) => (
                                            <div key={row.endpoint} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                                                <div className="text-sm font-medium truncate pr-2">{row.endpoint}</div>
                                                <div className="text-xs text-muted-foreground whitespace-nowrap">{row.avgDurationMs}ms avg · {row.count}x</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Fehlgeschlagene Scans</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {summary.scans.recentFailed.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">Keine fehlgeschlagenen Scans im Zeitfenster.</div>
                                ) : (
                                    <div className="space-y-3 max-h-[320px] overflow-auto pr-1">
                                        {summary.scans.recentFailed.map((row) => (
                                            <div key={row.id} className="rounded-md border p-2">
                                                <div className="text-xs text-muted-foreground">{new Date(row.timestamp).toLocaleString()}</div>
                                                <div className="text-sm font-medium">{row.eventType} · {row.entityType}</div>
                                                <div className="text-xs text-red-600">{row.status}{row.errorMessage ? `: ${row.errorMessage}` : ""}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
