"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { fetchClient } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Package } from "lucide-react"
import Link from "next/link"

interface Item {
    id: number
    name: string
    quantity: number
    photoUrl: string | null
    crate: {
        number: string
        cabinet: { number: string }
    }
}

function SearchResults() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q')
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (query) {
            setLoading(true)
            fetchClient(`/items/search?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => {
                    setItems(data)
                    setLoading(false)
                })
                .catch(() => setLoading(false))
        }
    }, [query])

    if (!query) return <div className="p-8">Please enter a search term.</div>

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold">Search: "{query}"</h1>
            {loading ? <Loader2 className="animate-spin" /> : (
                <div className="space-y-2">
                    {items.length > 0 ? (
                        items.map(item => (
                            <Link key={item.id} href={`/items/${item.id}`}>
                                <Card className="hover:bg-accent transition-colors">
                                    <CardContent className="p-4 flex items-center space-x-4">
                                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                                            {item.photoUrl ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={`http://localhost:3000${item.photoUrl}`} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <Package className="h-5 w-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {item.crate?.cabinet?.number} / {item.crate?.number}
                                            </div>
                                        </div>
                                        <div className="font-bold">{item.quantity}</div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="text-muted-foreground">No items found.</div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<Loader2 className="animate-spin" />}>
            <SearchResults />
        </Suspense>
    )
}
