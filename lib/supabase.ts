import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// Client Component용 (브라우저)
export const createBrowserClient = () => {
    return createClientComponentClient();
};

// 일반 클라이언트 (환경변수 직접 사용)
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Database Types
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    display_name: string | null;
                    avatar_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    display_name?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    display_name?: string | null;
                    avatar_url?: string | null;
                    updated_at?: string;
                };
            };
            portfolio_items: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    ticker: string;
                    quantity: number;
                    current_price: number;
                    dividend_yield: number;
                    dividend_day: number | null;
                    sector: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    ticker: string;
                    quantity: number;
                    current_price: number;
                    dividend_yield: number;
                    dividend_day?: number | null;
                    sector?: string | null;
                    created_at?: string;
                };
                Update: {
                    name?: string;
                    ticker?: string;
                    quantity?: number;
                    current_price?: number;
                    dividend_yield?: number;
                    dividend_day?: number | null;
                    sector?: string | null;
                };
            };
            yearly_dividends: {
                Row: {
                    id: string;
                    user_id: string;
                    portfolio_item_id: string;
                    year: number;
                    month_1: number;
                    month_2: number;
                    month_3: number;
                    month_4: number;
                    month_5: number;
                    month_6: number;
                    month_7: number;
                    month_8: number;
                    month_9: number;
                    month_10: number;
                    month_11: number;
                    month_12: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    portfolio_item_id: string;
                    year: number;
                    month_1?: number;
                    month_2?: number;
                    month_3?: number;
                    month_4?: number;
                    month_5?: number;
                    month_6?: number;
                    month_7?: number;
                    month_8?: number;
                    month_9?: number;
                    month_10?: number;
                    month_11?: number;
                    month_12?: number;
                    created_at?: string;
                };
                Update: {
                    year?: number;
                    month_1?: number;
                    month_2?: number;
                    month_3?: number;
                    month_4?: number;
                    month_5?: number;
                    month_6?: number;
                    month_7?: number;
                    month_8?: number;
                    month_9?: number;
                    month_10?: number;
                    month_11?: number;
                    month_12?: number;
                };
            };
        };
    };
}
