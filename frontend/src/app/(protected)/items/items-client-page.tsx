"use client"

import { useEffect, useState } from "react"
import { fetchClient } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"

interface Item {
    id: number
    name: string
    quantity: number
    crate: {
        number: string
        cabinet: { number: string }
    }
}

export function ItemsClientPage() {
    const [items, setItems] = useState<Item[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const searchParams = useSearchParams()
    const lowStock = searchParams.get('lowStock')

    useEffect(() => {
        let url = '/items'

        if (search) {
            url = `/items/search?q=${search}`
        } else if (lowStock === 'true') {
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
    }, [search, lowStock])

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

            {lowStock === 'true' && (
                <div className="flex items-center justify-between bg-destructive/10 text-destructive px-4 py-2 rounded-md">
                    <span className="text-sm font-medium">Filtering by Low Stock (&lt; 5)</span>
                    <Link href="/items">
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-destructive hover:text-destructive/80">Clear</Button>
                    </Link>
                </div>
            )}

            <div className="grid gap-2">
                {items.map(item => (
                    <Link key={item.id} href={`/items/${item.id}`}>
                        <Card className="hover:bg-accent transition-colors">
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <div className="font-semibold">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Cab {item.crate.cabinet.number} / {item.crate.number}
                                    </div>
                                </div>
                                <div className="font-bold text-lg bg-secondary text-secondary-foreground px-2 py-1 rounded">
                                    {item.quantity}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {!loading && items.length === 0 && <div className="text-center p-4">No items found.</div>}
            </div>
        </div>
    )
}
