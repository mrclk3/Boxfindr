"use client"

import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import React from "react"

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [user, setUser] = React.useState<{ email: string, role: string } | null>(null)
    const isAuthenticated = !!user

    React.useEffect(() => {
        const checkAuth = async () => {
            let token = localStorage.getItem("token")
            if (!token) {
                // Auto-login as guest
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/guest`, { method: 'POST' })
                    if (res.ok) {
                        const data = await res.json()
                        token = data.access_token
                        localStorage.setItem("token", token!)
                    }
                } catch (e) {
                    console.error("Guest login failed", e)
                }
            }

            if (token) {
                try {
                    // Simple decode
                    const payload = JSON.parse(atob(token.split('.')[1]))
                    setUser({ email: payload.email, role: payload.role })
                    // setIsAuthenticated(true) - removed
                } catch (e) {
                    // setIsAuthenticated(false) - removed
                }
            } else {
                // setIsAuthenticated(false) - removed
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

    return (
        <div className="flex min-h-screen flex-col bg-background pb-20">
            <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 shadow-sm bg-gradient-to-r from-background to-secondary/10">
                <div className="font-bold text-lg text-primary">Boxfindr</div>
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    {isAuthenticated && user ? (
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
                        <div className="text-sm text-muted-foreground">Logging in...</div>
                    )}
                </div>
            </header>
            <main className="flex-1 p-4">
                {children}
            </main>
            <BottomNav />
        </div>
    )
}
