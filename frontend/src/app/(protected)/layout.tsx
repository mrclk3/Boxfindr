"use client"

import Link from "next/link"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // <- Neu hinzugefügt
import { useRouter } from "next/navigation"
import { Loader2, LogOut, Search } from "lucide-react" // <- Search Icon hinzugefügt
import { ModeToggle } from "@/components/mode-toggle"
import { fetchClient } from "@/lib/api"
import "./../globals.css"
import React from "react"

// Interface für die Suchvorschläge
interface SearchSuggestion {
    id: number
    name: string
    quantity: number
    crate?: {
        number: string
        cabinet?: { number: string }
    }
}

// Neue Komponente für die Suchleiste im Header
function GlobalSearch() {
    const [query, setQuery] = React.useState("")
    const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([])
    const [showDropdown, setShowDropdown] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        // Erst ab 3 Zeichen suchen
        if (query.trim().length >= 3) {
            // Debounce: 300ms warten, bevor die API aufgerufen wird
            const timer = setTimeout(async () => {
                try {
                    const res = await fetchClient(`/items/search?q=${encodeURIComponent(query)}`)
                    if (res.ok) {
                        const data = await res.json()
                        setSuggestions(data.slice(0, 5)) // Maximal 5 Vorschläge anzeigen
                        setShowDropdown(true)
                    }
                } catch (e) {
                    console.error("Suche fehlgeschlagen", e)
                }
            }, 300)
            return () => clearTimeout(timer)
        } else {
            setSuggestions([])
            setShowDropdown(false)
        }
    }, [query])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            setShowDropdown(false)
            router.push(`/search?q=${encodeURIComponent(query)}`)
        }
    }

    return (
        <div className="relative flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Items suchen..."
                    className="pl-8 bg-background h-9"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (query.length >= 3) setShowDropdown(true) }}
                    // Kurzes Timeout beim Blur, damit der Klick auf einen Vorschlag noch registriert wird
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />
            </form>
            
            {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-background border rounded-md shadow-lg z-50 overflow-hidden">
                    {suggestions.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => {
                                setShowDropdown(false)
                                setQuery("") // Sucheingabe nach Navigation leeren
                                router.push(`/items/${item.id}`)
                            }}
                            className="p-2 hover:bg-accent cursor-pointer border-b last:border-0 flex flex-col"
                        >
                            <span className="text-sm font-medium truncate">{item.name}</span>
                            <span className="text-xs text-muted-foreground truncate">
                                Menge: {item.quantity} 
                                {item.crate && ` • Box: ${item.crate.number}`}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [user, setUser] = React.useState<{ email: string, role: string } | null>(null)
    const [mounted, setMounted] = React.useState(false)
    const [authStatus, setAuthStatus] = React.useState<'checking' | 'authenticated' | 'anonymous'>('checking')
    const isAuthenticated = !!user

    React.useEffect(() => {
        const checkAuth = async () => {
            setAuthStatus('checking')
            try {
                let token = localStorage.getItem("token")
                if (!token) {
                    const controller = new AbortController()
                    const timeoutId = window.setTimeout(() => controller.abort(), 5000)
                    try {
                        const res = await fetchClient('/auth/guest', {
                            method: 'POST',
                            signal: controller.signal,
                        })
                        if (res.ok) {
                            const data = await res.json()
                            token = data.access_token
                            localStorage.setItem("token", token!)
                        }
                    } catch (e) {
                        console.error("Guest login failed", e)
                    } finally {
                        window.clearTimeout(timeoutId)
                    }
                }

                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]))
                        setUser({ email: payload.email, role: payload.role })
                        setAuthStatus('authenticated')
                    } catch (e) {
                        setUser(null)
                        setAuthStatus('anonymous')
                    }
                } else {
                    setUser(null)
                    setAuthStatus('anonymous')
                }
            } catch (e) {
                setUser(null)
                setAuthStatus('anonymous')
            } finally {
                setMounted(true)
            }
        }
        checkAuth()
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("token")
        setUser(null)
        window.location.reload()
    }

    const handleLogin = () => {
        router.push("/login")
    }

    if (!mounted) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center" suppressHydrationWarning>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Seite wird geladen...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-background pb-20" suppressHydrationWarning>
            <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 shadow-sm bg-gradient-to-r from-background to-secondary/10">
                <Link href="/dashboard" className="font-bold text-lg text-primary hover:opacity-80 transition-opacity whitespace-nowrap">
                    Boxfindr
                </Link>
                
                {/* Hier binden wir die neue Suchleiste ein */}
                <GlobalSearch />

                <div className="flex items-center gap-2">
                    <ModeToggle />
                    {mounted && (isAuthenticated && user ? (
                        <div className="flex items-center gap-2">
                            {user.email === 'guest@codelab.eu' ? (
                                <>
                                    <span className="text-xs text-muted-foreground hidden sm:inline-block">Guest Mode</span>
                                    <Button variant="outline" size="sm" onClick={handleLogin}>
                                        Admin Login
                                    </Button>
                                </>
                            ) : (
                                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                                    <LogOut className="h-5 w-5" />
                                    <span className="sr-only">Logout</span>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Button variant="outline" size="sm" onClick={handleLogin} disabled={authStatus === 'checking'}>
                            {authStatus === 'checking' ? 'Anmelden...' : 'Login'}
                        </Button>
                    ))}
                </div>
            </header>
            <main className="flex-1 p-4">
                {children}
            </main>
            <BottomNav />
        </div>
    )
}