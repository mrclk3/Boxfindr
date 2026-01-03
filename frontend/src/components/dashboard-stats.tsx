"use client"

import { useEffect, useState } from "react"
import { fetchClient } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, Layers } from "lucide-react"
import Link from "next/link"

export function DashboardStats() {
    const [stats, setStats] = useState<{
        totalItems: number,
        lowStockItems: number,
        totalQuantity: number,
        categories?: { name: string, count: number }[]
    }>({ totalItems: 0, lowStockItems: 0, totalQuantity: 0, categories: [] })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchClient('/items/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data)
                setLoading(false)
            })
            .catch(err => setLoading(false))
    }, [])

    if (loading) return null // Or a skeleton

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalItems}</div>
                    <p className="text-xs text-muted-foreground">Unique types of items</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalQuantity}</div>
                    <p className="text-xs text-muted-foreground">Individual units in stock</p>
                </CardContent>
            </Card>
            <Link href="/items?lowStock=true" className="block transition-transform hover:scale-105">
                <Card className="h-full cursor-pointer hover:border-destructive/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${stats.lowStockItems > 0 ? "text-destructive" : "text-muted-foreground"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.lowStockItems > 0 ? "text-destructive" : ""}`}>{stats.lowStockItems}</div>
                        <p className="text-xs text-muted-foreground">Items with less than 5 units</p>
                    </CardContent>
                </Card>
            </Link>

            <Card className="md:col-span-3">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Items per Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        {stats.categories && stats.categories.length > 0 ? (
                            stats.categories.map((cat: any) => (
                                <div key={cat.name} className="flex flex-col items-center p-2 bg-secondary rounded-md min-w-[100px]">
                                    <span className="text-xl font-bold">{cat.count}</span>
                                    <span className="text-xs text-muted-foreground">{cat.name}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground">No categories defined</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
