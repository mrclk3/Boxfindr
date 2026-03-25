"use client"

import Link from "next/link"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Loader2, LogOut } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { fetchClient } from "@/lib/api"
import "./../globals.css"
import React from "react"

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
                    // Auto-login as guest with timeout to avoid hanging in checking state
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
                        // Simple decode
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
                <Link href="/dashboard" className="font-bold text-lg text-primary hover:opacity-80 transition-opacity">
                    Boxfindr
                </Link>
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
