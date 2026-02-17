"use client"

import React, { useEffect, useState } from "react"
import { fetchClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2, ArrowLeft, Box, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface Crate {
    id: number
    number: string
    qrCode: string
}

interface Cabinet {
    id: number
    number: string
    location: string | null
    crates: Crate[]
}

export default function CabinetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const [cabinet, setCabinet] = useState<Cabinet | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const [crateNumber, setCrateNumber] = useState("")
    const [crateQr, setCrateQr] = useState("")
    const [creatingCrate, setCreatingCrate] = useState(false)
    const [open, setOpen] = useState(false)

    const fetchCabinet = () => {
        setLoading(true)
        fetchClient(`/cabinets/${id}`)
            .then(res => res.json())
            .then(data => {
                setCabinet(data)
                setLoading(false)
            })
            .catch(err => setLoading(false))
    }

    useEffect(() => {
        fetchCabinet()
    }, [id])

    const handleCreateCrate = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreatingCrate(true)
        try {
            const res = await fetchClient('/crates', {
                method: 'POST',
                body: JSON.stringify({
                    number: crateNumber,
                    qrCode: crateQr,
                    cabinetId: Number(id)
                })
            })
            if (!res.ok) throw new Error("Failed to create crate")

            toast.success("Crate created")
            setOpen(false)
            setCrateNumber("")
            setCrateQr("")
            fetchCabinet()
        } catch (err) {
            console.error(err)
            toast.error("Failed to create crate")
        } finally {
            setCreatingCrate(false)
        }
    }

    const [crateToDelete, setCrateToDelete] = useState<number | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const handleDeleteCrate = async () => {
        if (!crateToDelete) return

        try {
            const res = await fetchClient(`/crates/${crateToDelete}`, {
                method: 'DELETE'
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to delete crate")
            }

            toast.success("Crate deleted")
            setDeleteDialogOpen(false)
            fetchCabinet()
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || "Failed to delete crate")
        }
    }

    const [deleteCabinetDialogOpen, setDeleteCabinetDialogOpen] = useState(false)

    const handleDeleteCabinet = async () => {
        if (!cabinet) return

        try {
            const res = await fetchClient(`/cabinets/${cabinet.id}`, {
                method: 'DELETE'
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to delete cabinet")
            }

            toast.success("Cabinet deleted")
            router.push('/cabinets')
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || "Failed to delete cabinet")
        }
    }

    if (loading && !cabinet) return <div className="p-8"><Loader2 className="animate-spin" /></div>
    if (!cabinet && !loading) return <div className="p-8">Cabinet not found</div>

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Cabinet {cabinet?.number}</h1>
                </div>
                {typeof window !== 'undefined' && !!localStorage.getItem("token") && (
                    <div title={cabinet?.crates && cabinet.crates.length > 0 ? "Cannot delete cabinet with crates" : "Delete Cabinet"}>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteCabinetDialogOpen(true)}
                            disabled={cabinet?.crates && cabinet.crates.length > 0}
                        >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Cabinet
                        </Button>
                    </div>
                )}
            </div>

            <div className="text-sm text-muted-foreground">
                Location: {cabinet?.location || 'N/A'}
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Crates</h2>
                {typeof window !== 'undefined' && !!localStorage.getItem("token") && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-1" /> Add Crate
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Crate to Cabinet {cabinet?.number}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateCrate} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Crate Number/ID</Label>
                                    <Input required value={crateNumber} onChange={e => setCrateNumber(e.target.value)} placeholder="e.g. A1" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>QR Code Value</Label>
                                    <Input required value={crateQr} onChange={e => setCrateQr(e.target.value)} placeholder="Unique QR" />
                                </div>
                                <Button type="submit" className="w-full" disabled={creatingCrate}>
                                    {creatingCrate ? <Loader2 className="animate-spin mr-2" /> : null} Create
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {cabinet?.crates && cabinet.crates.length > 0 ? (
                    cabinet.crates.map(crate => (
                        <div key={crate.id} className="relative group">
                            <Link href={`/crates/${crate.id}`}>
                                <Card className="hover:bg-accent transition-colors flex flex-col items-center justify-center p-4 h-24">
                                    <Box className="h-6 w-6 mb-2 text-primary" />
                                    <span className="font-medium">Crate {crate.number}</span>
                                </Card>
                            </Link>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setCrateToDelete(crate.id)
                                    setDeleteDialogOpen(true)
                                }}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 text-center text-muted-foreground p-4">No crates in this cabinet.</div>
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

            <Dialog open={deleteCabinetDialogOpen} onOpenChange={setDeleteCabinetDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Cabinet</DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete this cabinet? This action cannot be undone.
                            Cabinets containing crates cannot be deleted.
                        </p>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setDeleteCabinetDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteCabinet}>Delete</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
