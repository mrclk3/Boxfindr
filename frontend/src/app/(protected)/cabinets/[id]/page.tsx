"use client"

import React, { useEffect, useState } from "react"
import { fetchClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2, ArrowLeft, Box, Plus } from "lucide-react"
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

    if (loading && !cabinet) return <div className="p-8"><Loader2 className="animate-spin" /></div>
    if (!cabinet && !loading) return <div className="p-8">Cabinet not found</div>

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Cabinet {cabinet?.number}</h1>
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
                        <Link key={crate.id} href={`/crates/${crate.id}`}>
                            <Card className="hover:bg-accent transition-colors flex flex-col items-center justify-center p-4 h-24">
                                <Box className="h-6 w-6 mb-2 text-primary" />
                                <span className="font-medium">Crate {crate.number}</span>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-2 text-center text-muted-foreground p-4">No crates in this cabinet.</div>
                )}
            </div>
        </div>
    )
}
