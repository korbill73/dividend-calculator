"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // OAuth 콜백 후 세션 확인
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Auth callback error:', error);
                    router.push('/login?error=auth_failed');
                    return;
                }

                if (session) {
                    // 로그인 성공 - 대시보드로 이동
                    router.push('/');
                } else {
                    // 세션 없음 - 로그인 페이지로
                    router.push('/login');
                }
            } catch (error) {
                console.error('Unexpected error:', error);
                router.push('/login?error=unexpected');
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">로그인 처리 중...</p>
            </div>
        </div>
    );
}
