"use client"

import { useEffect, useState } from "react"
import { fetchClient } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Cabinet {
    id: number
    number: string
    location: string | null
    qrCode?: string
    updatedAt?: string
}

export default function CabinetsPage() {
    const [cabinets, setCabinets] = useState<Cabinet[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [sortBy, setSortBy] = useState("UPDATED_DESC")

    useEffect(() => {
        fetchClient('/cabinets')
            .then(res => res.json())
            .then(data => {
                setCabinets(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    const visibleCabinets = cabinets
        .filter((cabinet) => {
            const q = search.trim().toLowerCase()
            if (!q) return true
            return (
                cabinet.number.toLowerCase().includes(q) ||
                (cabinet.location || "").toLowerCase().includes(q)
            )
        })
        .sort((a, b) => {
            if (sortBy === "NUMBER_ASC") return a.number.localeCompare(b.number)
            if (sortBy === "NUMBER_DESC") return b.number.localeCompare(a.number)

            const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
            const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
            return bTime - aTime
        })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Cabinets</h1>
                {/* Only show Add button if logged in */}
                {typeof window !== 'undefined' && !!localStorage.getItem("token") && (
                    <Link href="/cabinets/new">
                        <Button size="icon" variant="outline">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search cabinet number/location..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="UPDATED_DESC">Recently updated</SelectItem>
                        <SelectItem value="NUMBER_ASC">Number A-Z</SelectItem>
                        <SelectItem value="NUMBER_DESC">Number Z-A</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4">
                {visibleCabinets.map((cabinet) => (
                    <Link key={cabinet.id} href={`/cabinets/${cabinet.id}`}>
                        <Card className="hover:bg-accent transition-colors">
                            <CardHeader className="p-4">
                                <CardTitle className="text-lg">Cabinet {cabinet.number}</CardTitle>
                                <div className="text-sm text-muted-foreground">{cabinet.location}</div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
                {visibleCabinets.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">No cabinets found.</div>
                )}
            </div>
        </div>
    )
}
