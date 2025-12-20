"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    PieChart,
    TrendingUp,
    Settings,
    BarChart3,
    LogOut,
    User,
    BookOpen,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";

const navItems = [
    {
        title: "Dashboard",
        subtitle: "대시보드",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Dividend Tracker",
        subtitle: "배당 관리",
        href: "/dividends",
        icon: PieChart,
    },
    {
        title: "Dividend History",
        subtitle: "배당 통계",
        href: "/dividends/history",
        icon: BarChart3,
    },
    {
        title: "Asset Simulation",
        subtitle: "자산 시뮬레이션",
        href: "/simulation",
        icon: TrendingUp,
    },
    {
        title: "Manual",
        subtitle: "사용자 매뉴얼",
        href: "/manual",
        icon: BookOpen,
    },
    {
        title: "Settings",
        subtitle: "설정",
        href: "/settings",
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    return (
        <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex-col">
            <div className="h-full flex flex-col">
                <Link href="/" className="block p-4 border-b border-amber-500/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <img src="/logo-gold.png" alt="Findash" className="w-12 h-12 object-contain drop-shadow-lg mix-blend-lighten" />
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent tracking-tight">
                                FinDash
                            </h1>
                            <p className="text-[10px] text-amber-400/80 font-medium -mt-0.5">
                                핀대시
                            </p>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Smart Asset Manager
                    </p>
                </Link>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                pathname === item.href
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium leading-tight">{item.title}</span>
                                <span className="text-[10px] text-muted-foreground leading-tight">{item.subtitle}</span>
                            </div>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-border space-y-3">
                    {user ? (
                        <>
                            <div className="flex items-center gap-3 px-3 py-2 bg-accent/50 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    {user.user_metadata?.avatar_url ? (
                                        <Image
                                            src={user.user_metadata.avatar_url}
                                            alt="Avatar"
                                            width={40}
                                            height={40}
                                            className="rounded-full"
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
    );
}
