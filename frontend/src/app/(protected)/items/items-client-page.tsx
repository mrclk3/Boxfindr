"use client"

import { useEffect, useState } from "react"
import { fetchClient } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Item {
    id: number
    name: string
    quantity: number
    minQuantity: number
    updatedAt?: string
    crate: {
        number: string
        cabinet: { number: string } | null
    } | null
}

export function ItemsClientPage() {
    const [items, setItems] = useState<Item[]>([])
    const [search, setSearch] = useState("")
    const [quantityFilter, setQuantityFilter] = useState("ALL")
    const [sortBy, setSortBy] = useState("UPDATED_DESC")
    const [loading, setLoading] = useState(true)
    const searchParams = useSearchParams()
    const lowStock = searchParams.get('lowStock')

    useEffect(() => {
        let url = '/items'
        if (lowStock === 'true') {
            url = '/items?lowStock=true'
        }

        setLoading(true)
        fetchClient(url)
            .then(res => res.json())
            .then(data => {
                setItems(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(err => setLoading(false))
    }, [lowStock])

    const visibleItems = items
        .filter((item) => {
            const q = search.trim().toLowerCase()
            if (!q) return true
            return (
                item.name.toLowerCase().includes(q) ||
                item.crate?.number?.toLowerCase().includes(q) ||
                item.crate?.cabinet?.number?.toLowerCase().includes(q)
            )
        })
        .filter((item) => {
            if (quantityFilter === "LOW_STOCK") return item.quantity < item.minQuantity
            if (quantityFilter === "OUT_OF_STOCK") return item.quantity === 0
            if (quantityFilter === "IN_STOCK") return item.quantity > 0
            return true
        })
        .sort((a, b) => {
            if (sortBy === "QTY_ASC") return a.quantity - b.quantity
            if (sortBy === "QTY_DESC") return b.quantity - a.quantity
            if (sortBy === "NAME_ASC") return a.name.localeCompare(b.name)

            const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
            const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
            return bTime - aTime
        })

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search all items..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Link href="/items/new">
                    <Button size="icon"><Plus className="h-4 w-4" /></Button>
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <Select value={quantityFilter} onValueChange={setQuantityFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All quantities</SelectItem>
                        <SelectItem value="LOW_STOCK">Low stock</SelectItem>
                        <SelectItem value="OUT_OF_STOCK">Out of stock</SelectItem>
                        <SelectItem value="IN_STOCK">In stock</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="UPDATED_DESC">Recently updated</SelectItem>
                        <SelectItem value="QTY_ASC">Qty ascending</SelectItem>
                        <SelectItem value="QTY_DESC">Qty descending</SelectItem>
                        <SelectItem value="NAME_ASC">Name A-Z</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {lowStock === 'true' && (
                <div className="flex items-center justify-between bg-destructive/10 text-destructive px-4 py-2 rounded-md">
                    <span className="text-sm font-medium">Filtering by Low Stock (&lt; 5)</span>
                    <Link href="/items">
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-destructive hover:text-destructive/80">Clear</Button>
                    </Link>
                </div>
            )}

            <div className="grid gap-2">
                {visibleItems.map(item => (
                    <Link key={item.id} href={`/items/${item.id}`}>
                        <Card className="hover:bg-accent transition-colors">
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <div className="font-semibold">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {item.crate && item.crate.cabinet
                                            ? `Cab ${item.crate.cabinet.number} / ${item.crate.number}`
                                            : item.crate
                                                ? `Crate ${item.crate.number}`
                                                : "No crate assigned"}
                                    </div>
                                </div>
                                <div className="font-bold text-lg bg-secondary text-secondary-foreground px-2 py-1 rounded">
                                    {item.quantity}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {!loading && visibleItems.length === 0 && <div className="text-center p-4">No items found.</div>}
            </div>
        </div>
    )
}
