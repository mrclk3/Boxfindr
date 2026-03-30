import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Scan, Box, Layers, History, Package, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
    const pathname = usePathname()
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                if (payload.role === 'ADMIN') setIsAdmin(true)
            } catch (e) { }
        }
    }, [])

    const links = [
        { href: "/dashboard", label: "Home", icon: Home },
        { href: "/cabinets", label: "Cabinets", icon: Box },
        { href: "/categories", label: "Cats", icon: Layers },
        { href: "/items", label: "Items", icon: Package },
        { href: "/scan", label: "Scan", icon: Scan },
    ]

    if (isAdmin) {
        links.push({ href: "/audit-logs", label: "History", icon: History })
        links.push({ href: "/status", label: "Status", icon: Activity })
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-2">
            <div className="overflow-x-auto md:overflow-visible">
                <div className="flex w-max min-w-full snap-x snap-mandatory gap-1 px-1 md:w-full md:min-w-0 md:justify-around md:snap-none">
                {links.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "snap-start flex-none min-w-[68px] flex flex-col items-center justify-center space-y-1 rounded-md px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors hover:bg-accent hover:text-accent-foreground md:flex-1 md:min-w-0",
                            pathname === href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                    </Link>
                ))}
                </div>
            </div>
        </nav>
    )
}
