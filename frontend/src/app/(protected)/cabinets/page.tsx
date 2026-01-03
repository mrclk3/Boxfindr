"use client"

import { useEffect, useState } from "react"
import { fetchClient } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2, Plus } from "lucide-react"

interface Cabinet {
    id: number
    number: string
    location: string | null
    qrCode: string
}

export default function CabinetsPage() {
    const [cabinets, setCabinets] = useState<Cabinet[]>([])
    const [loading, setLoading] = useState(true)

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

            <div className="grid gap-4">
                {cabinets.map((cabinet) => (
                    <Link key={cabinet.id} href={`/cabinets/${cabinet.id}`}>
                        <Card className="hover:bg-accent transition-colors">
                            <CardHeader className="p-4">
                                <CardTitle className="text-lg">Cabinet {cabinet.number}</CardTitle>
                                <div className="text-sm text-muted-foreground">{cabinet.location}</div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
                {cabinets.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">No cabinets found.</div>
                )}
            </div>
        </div>
    )
}
