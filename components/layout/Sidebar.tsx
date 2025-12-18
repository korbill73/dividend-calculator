"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    PieChart,
    TrendingUp,
    Settings,
    Menu,
    BarChart3,
    LogOut,
    User,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";

const navItems = [
    {
        title: "Dashboard (대시보드)",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Dividend Tracker (배당 관리)",
        href: "/dividends",
        icon: PieChart,
    },
    {
        title: "Dividend History (배당 통계)",
        href: "/dividends/history",
        icon: BarChart3,
    },
    {
        title: "Asset Simulation (자산 시뮬레이션)",
        href: "/simulation",
        icon: TrendingUp,
    },
    {
        title: "Settings (설정)",
        href: "/settings",
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { user, signOut } = useAuth();

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="md:hidden p-4 border-b border-border bg-card flex justify-between items-center">
                <h1 className="text-xl font-bold text-primary">FinDash</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-border">
                        <h1 className="text-2xl font-bold text-primary tracking-tight">
                            FinDash (핀대시)
                        </h1>
                        <p className="text-xs text-muted-foreground mt-1">
                            Personal Asset Manager
                        </p>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                    pathname === item.href
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-border space-y-3">
                        {user ? (
                            <>
                                <div className="flex items-center gap-3 px-3 py-2 bg-accent/50 rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        {user.user_metadata?.avatar_url ? (
                                            <img
                                                src={user.user_metadata.avatar_url}
                                                alt="Avatar"
                                                className="w-10 h-10 rounded-full"
                                            />
                                        ) : (
                                            <User className="w-5 h-5 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={signOut}
                                    className="w-full gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    로그아웃
                                </Button>
                            </>
                        ) : (
                            <Link href="/login">
                                <Button variant="default" size="sm" className="w-full">
                                    로그인
                                </Button>
                            </Link>
                        )}
                        <div className="text-xs text-muted-foreground text-center pt-2">
                            © 2025 FinDash
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
}
