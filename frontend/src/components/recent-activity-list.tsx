"use client"

import { useEffect, useState } from "react"
import { fetchClient } from "@/lib/api"
import { Loader2 } from "lucide-react"
// import { formatDistanceToNow } from "date-fns" // We might need to install date-fns or use native Intl

// Simple native formatter if date-fns not available
const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

interface AuditLog {
    id: number
    action: string
    details: string | null
    timestamp: string
    user: {
        email: string
    }
}

export function RecentActivityList() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchClient('/audit-logs')
            .then(res => res.json())
            .then(data => {
                setLogs(Array.isArray(data) ? data.slice(0, 10) : []) // Limit to 10
                setLoading(false)
            })
            .catch(err => setLoading(false))
    }, [])

    if (loading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>
    if (logs.length === 0) return <div className="p-4 text-sm text-muted-foreground text-center">No recent activity</div>

    return (
        <div className="max-h-[300px] overflow-y-auto divide-y">
            {logs.map(log => (
                <div key={log.id} className="flex flex-col px-3 py-2 text-sm hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-primary line-clamp-1">{log.action}</span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">{timeAgo(log.timestamp)}</span>
                    </div>
                    {log.details && <span className="text-xs text-muted-foreground line-clamp-1">{log.details}</span>}
                    <span className="text-[10px] text-muted-foreground/70 mt-0.5">by {log.user?.email?.split('@')[0]}</span>
                </div>
            ))}
        </div>
    )
}
