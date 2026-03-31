"use client"

import React, { useEffect, useState } from "react"
import { fetchClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Save, Edit, Minus, Plus } from "lucide-react" // Icons
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Move } from "lucide-react"
import { toast } from "sonner"

interface Item {
    id: number
    name: string
    qrCode?: string
    qrImageData?: string
    quantity: number
    minQuantity: number
    photoUrl: string | null
    status: string
    lentTo: string | null
    crate: {
        id: number
        number: string
        cabinet: {
            number: string
            location: string
        } | null
    } | null
}

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const [item, setItem] = useState<Item | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState("")
    const [minQuantity, setMinQuantity] = useState(0)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [moveOpen, setMoveOpen] = useState(false)
    const [copyOpen, setCopyOpen] = useState(false)
    const [cabinets, setCabinets] = useState<any[]>([])
    const [targetCrateId, setTargetCrateId] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isChangingStock, setIsChangingStock] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const isMountedRef = React.useRef(true)
    const requestControllersRef = React.useRef<Set<AbortController>>(new Set())

    const router = useRouter()

    useEffect(() => {
        return () => {
            isMountedRef.current = false
            requestControllersRef.current.forEach((controller) => controller.abort())
            requestControllersRef.current.clear()
        }
    }, [])

    const createTrackedController = () => {
        const controller = new AbortController()
        requestControllersRef.current.add(controller)
        return controller
    }

    const releaseTrackedController = (controller: AbortController) => {
        requestControllersRef.current.delete(controller)
    }


    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            setIsAdmin(false)
            return
        }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            setIsAdmin(payload.role === 'ADMIN')
        } catch {
            setIsAdmin(false)
        }
    }, [])

    useEffect(() => {
        const controller = createTrackedController()
        fetchClient(`/items/${id}`, { signal: controller.signal })
            .then(res => {
                if (!res.ok) throw new Error("Not found")
                return res.json()
            })
            .then(data => {
                if (!isMountedRef.current) return
                setItem(data)
                setName(data.name)
                setMinQuantity(data.minQuantity)
                setLoading(false)
            })
            .catch(err => {
                if (err?.name === 'AbortError') return
                if (!isMountedRef.current) return
                setLoading(false)
            })

        return () => {
            controller.abort()
            releaseTrackedController(controller)
        }
    }, [id])

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>
    if (!item) return <div className="p-8">Item not found</div>

    const handleSave = async () => {
        setIsSubmitting(true)
        const safeMinQuantity = Math.max(0, minQuantity)
        try {
            const res = await fetchClient(`/items/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, minQuantity: safeMinQuantity })
            })
            if (!res.ok) throw new Error("Failed to update")
            const updated = await res.json()
            setItem({ ...item, ...updated })
            setMinQuantity(safeMinQuantity)
            setEditing(false)
        } catch (e) {
            console.error(e)
            toast.error("Failed to save changes")
        } finally {
            setIsSubmitting(false)
        }
    }

    const fetchCabinets = async () => {
        if (cabinets.length > 0) return
        try {
            const res = await fetchClient('/cabinets?includeCrates=true')
            if (res.ok) setCabinets(await res.json())
        } catch (e) {
            console.error(e)
        }
    }

    const handleMove = async () => {
        if (!targetCrateId) return
        setIsSubmitting(true)
        const previousCrateId = item?.crate?.id
        try {
            const res = await fetchClient(`/items/${item.id}/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetCrateId: parseInt(targetCrateId) })
            })
            if (!res.ok) throw new Error("Failed to move")

            const updatedRes = await fetchClient(`/items/${item.id}`)
            if (updatedRes.ok) setItem(await updatedRes.json())

            setMoveOpen(false)
            setTargetCrateId("")

            if (previousCrateId) {
                toast.success("Item moved")
            }
        } catch (e) {
            toast.error("Failed to move item")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCopy = async () => {
        if (!targetCrateId) return
        setIsSubmitting(true)
        try {
            const res = await fetchClient(`/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: item.name,
                    quantity: 0,
                    minQuantity: item.minQuantity,
                    crateId: parseInt(targetCrateId),
                    categoryId: null // Optional
                })
            })
            if (!res.ok) throw new Error("Failed to copy")
            toast.success("Item copied to new box")
            setCopyOpen(false)
            setTargetCrateId("")
        } catch (e) {
            toast.error("Failed to copy item")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleStockChange = async (change: number) => {
        if (!item || isChangingStock) return

        const previousQuantity = item.quantity
        const optimisticQuantity = previousQuantity + change
        if (optimisticQuantity < 0) return

        setIsChangingStock(true)
        setItem((prev) => prev ? { ...prev, quantity: optimisticQuantity } : prev)

        const controller = createTrackedController()
        try {
            const res = await fetchClient(`/items/${item.id}/quantity`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ change }),
                signal: controller.signal,
            })

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}))
                throw new Error(errBody?.detail || "Failed to update quantity")
            }

            const newItem = await res.json()
            if (!isMountedRef.current) return
            setItem((prev) => prev ? { ...prev, quantity: newItem.quantity } : prev)

            toast.success(`Stock ${change > 0 ? 'increased' : 'decreased'}`)
        } catch (e: any) {
            if (e?.name === 'AbortError') return
            if (!isMountedRef.current) return
            setItem((prev) => prev ? { ...prev, quantity: previousQuantity } : prev)
            toast.error(e?.message || "Failed to update quantity")
        } finally {
            releaseTrackedController(controller)
            if (isMountedRef.current) {
                setIsChangingStock(false)
            }
        }
    }

    const handleDelete = async () => {
        if (!item) return
        try {
            const res = await fetchClient(`/items/${item.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error("Failed to delete")
            toast.success("Item deleted")
            setDeleteOpen(false)
            router.push('/items')
        } catch {
            toast.error("Failed to delete item (ensure quantity is 0)")
        }
    }

    const CrateSelector = ({ onSelect }: { onSelect: () => void }) => (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label>Select Target Crate</Label>
                <Select onValueChange={setTargetCrateId} value={targetCrateId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a crate" />
                    </SelectTrigger>
                    <SelectContent>
                        {cabinets.map((cab: any) => (
                            <SelectGroup key={cab.id}>
                                <SelectLabel>Cabinet {cab.number} - {cab.location}</SelectLabel>
                                {cab.crates?.map((crate: any) => (
                                    <SelectItem key={crate.id} value={crate.id.toString()}>
                                        Crate {crate.number} {crate.category?.name ? `(${crate.category.name})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={onSelect} disabled={!targetCrateId || isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm
            </Button>
        </div>
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">{editing ? "Edit Item" : item.name}</h1>
                </div>
                <div className="flex space-x-2">
                    <Dialog open={moveOpen} onOpenChange={(o) => { setMoveOpen(o); if (o) fetchCabinets() }}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Move className="mr-2 h-4 w-4" /> Move
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Move Item</DialogTitle>
                                <DialogDescription>Select a new crate for this item.</DialogDescription>
                            </DialogHeader>
                            <CrateSelector onSelect={handleMove} />
                        </DialogContent>
                    </Dialog>

                    <Dialog open={copyOpen} onOpenChange={(o) => { setCopyOpen(o); if (o) fetchCabinets() }}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Copy className="mr-2 h-4 w-4" /> Copy to Box
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Copy Item to Box</DialogTitle>
                                <DialogDescription>Create a copy of this item in another crate (Initial stock: 0).</DialogDescription>
                            </DialogHeader>
                            <CrateSelector onSelect={handleCopy} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {item.photoUrl && !editing && (
                        <div className="relative h-48 w-full bg-gray-100 rounded-md overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${item.photoUrl}`} alt={item.name} className="object-cover w-full h-full" />
                        </div>
                    )}

                    {editing ? (
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="minQuantity">Min Quantity</Label>
                                <Input type="number" min={0} id="minQuantity" value={minQuantity} onChange={e => setMinQuantity(Math.max(0, parseInt(e.target.value) || 0))} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-2">
                                <Label>Quantity</Label>
                                <div className="flex items-center space-x-4">
                                    <Button size="icon" variant="outline" onClick={() => handleStockChange(-1)} disabled={item.quantity <= 0 || isChangingStock}><Minus className="h-4 w-4" /></Button>
                                    <span className="text-2xl font-bold">{item.quantity}</span>
                                    <Button size="icon" variant="outline" onClick={() => handleStockChange(1)} disabled={isChangingStock}><Plus className="h-4 w-4" /></Button>
                                </div>
                            </div>

                            <div className="grid gap-1">
                                <Label>Location</Label>
                                <div className="text-sm">
                                    {item.crate && item.crate.cabinet
                                        ? `Cabinet ${item.crate.cabinet.number}, Crate ${item.crate.number}`
                                        : item.crate
                                            ? `Crate ${item.crate.number}`
                                            : "No crate assigned"}
                                </div>
                            </div>

                            <div className="grid gap-1">
                                <Label>Status</Label>
                                <div className="text-sm font-medium">{item.status} {item.lentTo ? `(Lent to: ${item.lentTo})` : ''}</div>
                            </div>

                            {isAdmin && item.qrImageData && (
                                <div className="grid gap-2">
                                    <Label>Item QR (Admin)</Label>
                                    <div className="flex flex-col items-start gap-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.qrImageData} alt={`QR ${item.name}`} className="h-40 w-40 rounded border bg-white p-2" />
                                        <div className="text-xs text-muted-foreground break-all">{item.qrCode}</div>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-1">
                                <Label>Min Quantity</Label>
                                <div className="text-sm">{item.minQuantity}</div>
                            </div>
                        </>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive" disabled={item.quantity > 0}>Delete</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Delete Item</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete <strong>{item.name}</strong>?
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                                <Button variant="destructive" onClick={handleDelete}>Confirm Delete</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <div className="flex space-x-2">
                        {!editing && (
                            <Button onClick={() => setEditing(true)} variant="outline">
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Button>
                        )}
                        {editing && (
                            <Button onClick={handleSave}>
                                <Save className="mr-2 h-4 w-4" /> Save
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
