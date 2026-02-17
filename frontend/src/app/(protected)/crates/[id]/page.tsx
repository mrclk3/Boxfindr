"use client"
import React, { useEffect, useState } from "react"
import { fetchClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ArrowLeft, Package, Search, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Item {
    id: number
    name: string
    quantity: number
    photoUrl: string | null
}

interface Crate {
    id: number
    number: string
    qrCode: string
    cabinet: {
        id: number
        number: string
        location: string | null
    }
    items: Item[]
}

export default function CrateDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params) // This is ID or QR Code depending on route, backend supports both if implementation matches, but Frontend likely passes QR code or ID.
    // Ideally we use ID for routing, but cabinet view uses query param q=QR.
    // CratesController accepts :id which can be ID or QR.

    const [crate, setCrate] = useState<Crate | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        setLoading(true)
        // Adjust endpoint if ID is not number? Controller handles it.
        fetchClient(`/crates/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Not found")
                return res.json()
            })
            .then(data => {
                setCrate(data)
                setLoading(false)
            })
            .catch(err => setLoading(false))
    }, [id])

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const handleDeleteCrate = async () => {
        if (!crate) return

        try {
            const res = await fetchClient(`/crates/${crate.id}`, {
                method: 'DELETE'
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to delete crate")
            }

            toast.success("Crate deleted")
            router.push(`/cabinets/${crate.cabinet.id}`)
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || "Failed to delete crate")
        }
    }

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>
    if (!crate) return <div className="p-8">Crate not found</div>

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Crate {crate.number}</h1>
                        <div className="text-sm text-muted-foreground">
                            In Cabinet {crate.cabinet?.number}
                        </div>
                    </div>
                </div>
                {typeof window !== 'undefined' && !!localStorage.getItem("token") && (
                    <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Crate
                    </Button>
                )}
            </div>

            <h2 className="text-lg font-semibold">Items in this Crate</h2>
            <div className="space-y-2">
                {crate.items && crate.items.length > 0 ? (
                    crate.items.map(item => (
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
                                        <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="text-muted-foreground text-center py-8">
                        No items in this crate.
                        <div className="mt-4">
                            <Button asChild>
                                <Link href="/items/new">Add Item</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Crate</DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete this crate? This action cannot be undone.
                            Crates with items cannot be deleted.
                        </p>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteCrate}>Delete</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
