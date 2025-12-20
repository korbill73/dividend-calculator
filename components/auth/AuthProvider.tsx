"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load data from Supabase when user logs in
    useEffect(() => {
        if (user) {
            // Import dynamically to avoid circular dependency
            import('@/store/useFinanceStore').then(({ useFinanceStore }) => {
                const loadFromSupabase = useFinanceStore.getState().loadFromSupabase;
                loadFromSupabase(user.id);
            });
        }
    }, [user]);

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error signing in with Google:', error);
            alert('구글 로그인 중 오류가 발생했습니다.');
        }
    };

    const signOut = async () => {
        try {
            // Reset to sample data first
            const { useFinanceStore } = await import('@/store/useFinanceStore');
            const resetToSampleData = useFinanceStore.getState().resetToSampleData;
            resetToSampleData();
            
            // Clear local state immediately
            setUser(null);
            setSession(null);
            
            // Sign out from Supabase (use 'local' scope for better mobile support)
            await supabase.auth.signOut({ scope: 'local' });
            
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
            // Still navigate to login even if there's an error
            setUser(null);
            setSession(null);
            router.push('/login');
        }
    };

    const value = {
        user,
        session,
        loading,
        signInWithGoogle,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
