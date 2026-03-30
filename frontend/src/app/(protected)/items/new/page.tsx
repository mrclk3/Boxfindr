"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface Cabinet {
    id: number
    number: string
    crates: { id: number; number: string }[]
}

// NOTE: Fetching deep nested relations (Cabinets -> Crates) requires specialized endpoint or include
// For simplicity, we fetched /cabinets but default findMany might not include crates.
// We might need to fetch /cabinets?include=crates or separate calls.
// Assuming /cabinets returns simple list. We might strictly need crates.
// Let's assume we fetch /crates (all) or we update backend to allow fetching hierarchy.
// I'll try fetching /crates directly which includes cabinet info (ItemsService.findAll Crates does).
// Wait, CratesService.findAll includes cabinet.

interface Crate {
    id: number
    number: string
    cabinet: { id: number; number: string } | null
}

interface Category {
    id: number
    name: string
}

export default function NewItemPage() {
    const [crates, setCrates] = useState<Crate[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [name, setName] = useState("")
    const [quantity, setQuantity] = useState("0")
    const [minQuantity, setMinQuantity] = useState("0")
    const [crateId, setCrateId] = useState<string>("")
    const [categoryId, setCategoryId] = useState<string>("")
    const [file, setFile] = useState<File | null>(null)

    const router = useRouter()

    useEffect(() => {
        Promise.all([
            fetchClient('/crates').then(res => res.json()),
            fetchClient('/categories').then(res => res.json())
        ])
            .then(([cratesData, categoriesData]) => {
                setCrates(Array.isArray(cratesData) ? cratesData : [])
                setCategories(Array.isArray(categoriesData) ? categoriesData : [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        const safeQuantity = Math.max(0, Number(quantity))
        const safeMinQuantity = Math.max(0, Number(minQuantity))

        try {
            const res = await fetchClient('/items', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    quantity: safeQuantity,
                    minQuantity: safeMinQuantity,
                    crateId: Number(crateId),
                    categoryId: categoryId ? Number(categoryId) : null,
                    photoUrl: null,
                    status: 'AVAILABLE',
                    lentTo: null,
                })
            })

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}))
                throw new Error(errBody?.detail || "Failed to create item")
            }

            router.push('/items')
        } catch (err: any) {
            console.error(err)
            alert(err?.message || "Failed to create item")
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Item</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Name</Label>
                            <Input required value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Quantity</Label>
                                <Input type="number" min={0} required value={quantity} onChange={e => setQuantity(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Min. Qty</Label>
                                <Input type="number" min={0} required value={minQuantity} onChange={e => setMinQuantity(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <Select onValueChange={setCategoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category (Optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Location (Crate)</Label>
                            <Select onValueChange={setCrateId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Crate" />
                                </SelectTrigger>
                                <SelectContent>
                                    {crates.map(crate => (
                                        <SelectItem key={crate.id} value={crate.id.toString()}>
                                            {crate.cabinet
                                                ? `Cabinet ${crate.cabinet.number} - Crate ${crate.number}`
                                                : `Crate ${crate.number}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Photo</Label>
                            <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
                        </div>

                        <Button className="w-full" type="submit" disabled={submitting}>
                            {submitting ? <Loader2 className="animate-spin mr-2" /> : null} Create Item
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
