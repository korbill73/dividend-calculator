"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Chrome } from "lucide-react";

export default function LoginPage() {
    const { user, signInWithGoogle, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // 이미 로그인되어 있으면 대시보드로 리다이렉트
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <svg
                            className="w-10 h-10 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <CardTitle className="text-3xl font-bold">FinDash</CardTitle>
                    <CardDescription className="text-base">
                        개인 자산 및 배당금 관리 플랫폼
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm text-muted-foreground text-center">
                        <p>📊 포트폴리오 배당 관리</p>
                        <p>💰 자산 시뮬레이션</p>
                        <p>📈 연도별 통계 분석</p>
                    </div>

                    <div className="pt-4">
                        <Button
                            onClick={signInWithGoogle}
                            className="w-full h-12 text-base gap-3"
                            size="lg"
                        >
                            <Chrome className="w-5 h-5" />
                            Google로 로그인
                        </Button>
                    </div>

                    <div className="text-xs text-center text-muted-foreground pt-4 border-t">
                        <p>로그인하면 모든 기기에서</p>
                        <p>데이터를 동기화할 수 있습니다</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
