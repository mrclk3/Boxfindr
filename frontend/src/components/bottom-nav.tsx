"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Scan, Box, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
    const pathname = usePathname()

    const links = [
        { href: "/dashboard", label: "Home", icon: Home },
        { href: "/cabinets", label: "Cabinets", icon: Box },
        { href: "/categories", label: "Cats", icon: Layers }, // Short label for mobile
        { href: "/scan", label: "Scan", icon: Scan },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-2">
            <div className="flex justify-around">
                {links.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "flex flex-col items-center justify-center space-y-1 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                            pathname === href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    )
}
