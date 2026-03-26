"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { fetchClient } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Package, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Item {
    id: number
    name: string
    quantity: number
    photoUrl: string | null
    categoryId?: number
    crate?: {
        number: string
        cabinet?: { number: string }
    }
}

interface Category {
    id: number
    name: string
    description?: string
}

export default function CategoryDetailPage() {
    const params = useParams()
    const router = useRouter()
    const categoryId = params.id as string
    
    const [category, setCategory] = useState<Category | null>(null)
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadCategoryAndItems = async () => {
            setLoading(true)
            try {
                // 1. Kategorie-Details abrufen
                const catRes = await fetchClient(`/categories/${categoryId}`)
                if (catRes.ok) {
                    const catData = await catRes.json()
                    setCategory(catData)
                }

                // 2. Alle Items abrufen und nach Kategorie filtern
                // (Alternativ: fetchClient(`/items?categoryId=${categoryId}`) falls das Backend das unterstützt)
                const itemsRes = await fetchClient('/items')
                if (itemsRes.ok) {
                    const allItems: Item[] = await itemsRes.json()
                    // Filtere nur die Items, die zu dieser Kategorie gehören
                    const filteredItems = allItems.filter(item => item.categoryId === Number(categoryId))
                    setItems(filteredItems)
                }
            } catch (error) {
                console.error("Fehler beim Laden der Kategorie-Daten", error)
            } finally {
                setLoading(false)
            }
        }

        if (categoryId) {
            loadCategoryAndItems()
        }
    }, [categoryId])

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        )
    }

    if (!category) {
        return <div className="p-8 text-center text-muted-foreground">Kategorie nicht gefunden.</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" onClick={() => router.push('/categories')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{category.name}</h1>
                    {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <h2 className="text-lg font-semibold">Zugeordnete Items ({items.length})</h2>
                
                {items.length > 0 ? (
                    items.map(item => (
                        <Link key={item.id} href={`/items/${item.id}`} className="block">
                            <Card className="hover:bg-accent transition-colors">
                                <CardContent className="p-4 flex items-center space-x-4">
                                    <div className="h-10 w-10 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden flex items-center justify-center">
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
                                            {item.crate?.cabinet?.number ? `${item.crate.cabinet.number} / ` : ''}
                                            {item.crate?.number || 'Keine Box'}
                                        </div>
                                    </div>
                                    <div className="font-bold">{item.quantity}x</div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
                            <Package className="h-8 w-8 mb-2 opacity-20" />
                            <p>Keine Items in dieser Kategorie gefunden.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}