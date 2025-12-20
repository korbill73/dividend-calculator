"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    PieChart,
    TrendingUp,
    Settings,
    BarChart3,
} from "lucide-react";

const navItems = [
    {
        title: "대시보드",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "배당관리",
        href: "/dividends",
        icon: PieChart,
    },
    {
        title: "통계",
        href: "/dividends/history",
        icon: BarChart3,
    },
    {
        title: "시뮬레이션",
        href: "/simulation",
        icon: TrendingUp,
    },
    {
        title: "설정",
        href: "/settings",
        icon: Settings,
    },
];

export function MobileNav() {
    const pathname = usePathname();

    const isNavActive = (href: string) => {
        if (pathname === href) return true;
        if (href === "/") return false;
        if (href === "/dividends") {
            return pathname === "/dividends";
        }
        if (href === "/dividends/history") {
            return pathname === "/dividends/history" || pathname.startsWith("/dividends/history/");
        }
        return pathname.startsWith(href);
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const isActive = isNavActive(item.href);
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-colors min-w-0",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 mb-1",
                                isActive && "text-primary"
                            )} />
                            <span className={cn(
                                "text-[10px] font-medium truncate",
                                isActive && "text-primary"
                            )}>
                                {item.title}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
