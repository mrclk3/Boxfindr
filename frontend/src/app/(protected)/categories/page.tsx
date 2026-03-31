"use client"

import { useEffect, useState } from "react"
import { fetchClient } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"

interface Category {
    id: number
    name: string
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [creating, setCreating] = useState(false)
    const [open, setOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)

    const fetchCategories = () => {
        setLoading(true)
        fetchClient('/categories')
            .then(res => res.json())
            .then(data => {
                setCategories(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(err => setLoading(false))
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleDelete = async () => {
        const id = categoryToDelete
        if (!id) return

        try {
            const res = await fetchClient(`/categories/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error("Failed to delete")

            setCategories(prev => prev.filter(category => category.id !== id))
            toast.success("Category deleted")
            setDeleteDialogOpen(false)
            setCategoryToDelete(null)
        } catch (err) {
            toast.error("Failed to delete")
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)
        try {
            const res = await fetchClient('/categories', {
                method: 'POST',
                body: JSON.stringify({ name: newCategoryName })
            })
            if (!res.ok) throw new Error("Failed to create")

            toast.success("Category created")
            setNewCategoryName("")
            setOpen(false)
            fetchCategories()
        } catch (err) {
            toast.error("Failed to create category")
        } finally {
            setCreating(false)
        }
    }

    const handleDeleteClick = (e: React.MouseEvent, id: number) => {
        e.preventDefault()
        e.stopPropagation()

        setCategoryToDelete(id)
        setDeleteDialogOpen(true)
    }

    // Check if user is admin (simple local check for UI)
    const isAdmin = typeof window !== 'undefined' && localStorage.getItem('token')

    if (loading && categories.length === 0) return <div className="p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Categories</h1>
                {isAdmin && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" /> New Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Category</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Name</Label>
                                    <Input
                                        required
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        placeholder="e.g. Electronics"
                                    />
                                </div>
                                <Button type="submit" disabled={creating} className="w-full">
                                    {creating ? <Loader2 className="animate-spin mr-2" /> : null} Create
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map(cat => (
                    <Link key={cat.id} href={`/categories/${cat.id}`} className="block h-full">
                        <Card className="hover:bg-accent transition-colors cursor-pointer h-full flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-medium">{cat.name}</CardTitle>
                                {isAdmin && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => handleDeleteClick(e, cat.id)}
                                    >
                                        <Trash className="h-4 w-4 text-destructive" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="text-xs text-muted-foreground">ID: {cat.id}</div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {categories.length === 0 && <div className="col-span-3 text-center p-8">No categories found.</div>}
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete this category?
                        </p>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteDialogOpen(false)
                                setCategoryToDelete(null)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}