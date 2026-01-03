"use client"

import React, { useState, useEffect } from "react"
import { fetchClient } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, QrCode } from "lucide-react"
import Link from "next/link"
import { RecentActivityList } from "@/components/recent-activity-list"
import { DashboardStats } from "@/components/dashboard-stats"

export default function DashboardPage() {
    const [search, setSearch] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search.trim()) {
                setLoading(true)
                fetchClient(`/items/search?q=${encodeURIComponent(search)}`)
                    .then(res => res.json())
                    .then(data => {
                        setResults(Array.isArray(data) ? data : [])
                        setLoading(false)
                    })
                    .catch(err => {
                        console.error(err)
                        setLoading(false)
                    })
            } else {
                setResults([])
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [search])

    const [isAdmin, setIsAdmin] = useState(false)

    // Check admin role on mount
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                if (payload.role === 'ADMIN') {
                    setIsAdmin(true)
                } else {
                    setIsAdmin(false)
                }
            } catch (e) {
                setIsAdmin(false)
            }
        }
    }, [])

    return (
        <div className="space-y-6">
            <DashboardStats />
            <div className="space-y-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search items..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Search Results Dropdown/Area */}
                {(search.trim().length > 0) && (
                    <div className="rounded-md border bg-popover text-popover-foreground shadow-md max-h-[300px] overflow-auto">
                        {loading ? (
                            <div className="p-4 text-sm text-center">Searching...</div>
                        ) : results.length > 0 ? (
                            <div className="py-2">
                                {results.map((item) => (
                                    <Link key={item.id} href={`/items/${item.id}`} className="block px-4 py-2 hover:bg-accent hover:text-accent-foreground">
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Qty: {item.quantity} • Cabinet {item.crate?.cabinet?.number} / Crate {item.crate?.number}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-sm text-center text-muted-foreground">No items found.</div>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Link href="/scan">
                    <Card className="flex h-32 flex-col items-center justify-center space-y-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
                        <QrCode className="h-8 w-8" />
                        <span className="font-semibold">Scan QR</span>
                    </Card>
                </Link>
                <Link href="/items/new">
                    <Card className="flex h-32 flex-col items-center justify-center space-y-2 border-primary/20 hover:bg-accent transition-colors cursor-pointer">
                        <Plus className="h-8 w-8 text-primary" />
                        <span className="font-semibold">Add Item</span>
                    </Card>
                </Link>
            </div>

            {/* Only show recent activity if logged in as ADMIN */}
            {isAdmin && (
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
                    <Card>
                        <CardContent className="p-0">
                            <RecentActivityList />
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="space-y-2">
                <h2 className="text-lg font-semibold tracking-tight">Quick Links</h2>
                <div className="grid grid-cols-2 gap-2">
                    <Link href="/cabinets">
                        <Button variant="outline" className="w-full justify-start">Cabinets</Button>
                    </Link>
                    <Link href="/items">
                        <Button variant="outline" className="w-full justify-start">All Items</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
