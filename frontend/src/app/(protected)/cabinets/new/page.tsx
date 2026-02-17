"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { fetchClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function NewCabinetPage() {
    const [number, setNumber] = useState("")
    const [location, setLocation] = useState("")
    const [qrCode, setQrCode] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const res = await fetchClient('/cabinets', {
                method: 'POST',
                body: JSON.stringify({ number, location, qrCode })
            })

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to create cabinet");
            }

            toast.success("Cabinet created")
            router.push('/cabinets')
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || "Failed to create cabinet")
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-4 max-w-md mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Cabinet</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Cabinet Number</Label>
                            <Input required value={number} onChange={e => setNumber(e.target.value)} placeholder="e.g. 101" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Location</Label>
                            <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Warehouse A" />
                        </div>
                        <div className="grid gap-2">
                            <Label>QR Code Value</Label>
                            <Input required value={qrCode} onChange={e => setQrCode(e.target.value)} placeholder="Unique QR Value" />
                        </div>

                        <Button className="w-full" type="submit" disabled={submitting}>
                            {submitting ? <Loader2 className="animate-spin mr-2" /> : null} Create Cabinet
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
