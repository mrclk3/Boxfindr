"use client"

import { useState, useEffect } from "react"
import { fetchClient } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, FilterX } from "lucide-react"

interface AuditLog {
    id: number
    action: string
    details: string | null
    timestamp: string
    user: {
        email: string
    }
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    // Filters
    const [action, setAction] = useState<string>("ALL")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [userSearch, setUserSearch] = useState("") // Should be UserId in ideal world, but let's filter after fetch or add specific user search implementation later if complex. 
    // Wait, backend expects userId ID. Mapping email to ID is hard without a user list. 
    // For now, let's keep it simple: Filter by Action and Date first. User filter might need a UserSelect component.

    // Let's implement Action and Date filters effectively.

    useEffect(() => {
        // Check Admin
        const token = localStorage.getItem("token")
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                if (payload.role === 'ADMIN') setIsAdmin(true)
            } catch (e) { }
        }
    }, [])

    const fetchLogs = () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (action && action !== "ALL") params.append("action", action)
        if (startDate) params.append("startDate", new Date(startDate).toISOString())
        if (endDate) params.append("endDate", new Date(endDate).toISOString())
        // userId - we'd need to fetch users to allow picking one. Skipping specific user filter for this iteration unless essential.

        fetchClient(`/audit-logs?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setLogs(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }

    // Initial fetch
    useEffect(() => {
        if (isAdmin) fetchLogs()
        else setLoading(false)
    }, [isAdmin])

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault()
        fetchLogs()
    }

    const clearFilters = () => {
        setAction("ALL")
        setStartDate("")
        setEndDate("")
        // Trigger fetch via effect or manual? Manual is better to control refetch
        setTimeout(() => {
            // We need to pass clean state, state updates are async
            // Hacky way: just reload page or separate fetch params from state.
            // Better:
            window.location.reload() // Fastest cleanup for now
        }, 100)
    }

    if (!isAdmin) return <div className="p-8 text-center text-muted-foreground">Access Restricted (Admin Only)</div>

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Audit History</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleFilter} className="grid gap-4 md:grid-cols-4 items-end">
                        <div className="grid gap-2">
                            <Label>Action Type</Label>
                            <Select value={action} onValueChange={setAction}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Actions</SelectItem>
                                    <SelectItem value="CREATE">Create</SelectItem>
                                    <SelectItem value="UPDATE">Update</SelectItem>
                                    <SelectItem value="DELETE">Delete</SelectItem>
                                    <SelectItem value="STOCK_CHANGE">Stock Change</SelectItem>
                                    <SelectItem value="MOVE">Move</SelectItem>
                                    <SelectItem value="LENT">Lent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Start Date</Label>
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>End Date</Label>
                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1">
                                <Search className="mr-2 h-4 w-4" /> Filter
                            </Button>
                            <Button type="button" variant="outline" onClick={clearFilters}>
                                <FilterX className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="rounded-md border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Time</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Action</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">User</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Details</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin inline" /> Loading...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-muted-foreground">No records found matching filters.</td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="p-4 align-middle font-medium">{log.action}</td>
                                        <td className="p-4 align-middle">{log.user?.email}</td>
                                        <td className="p-4 align-middle">{log.details}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
