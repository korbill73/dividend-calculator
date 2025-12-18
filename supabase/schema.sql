-- =====================================================
-- Finance Dashboard - Supabase Database Schema
-- =====================================================
-- 이 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요
-- =====================================================

-- 1. Profiles 테이블 생성
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Portfolio Items 테이블 생성
CREATE TABLE IF NOT EXISTS public.portfolio_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    ticker TEXT NOT NULL,
    quantity NUMERIC DEFAULT 0,
    current_price NUMERIC DEFAULT 0,
    dividend_yield NUMERIC DEFAULT 0,
    dividend_day INTEGER,
    sector TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Yearly Dividends 테이블 생성
CREATE TABLE IF NOT EXISTS public.yearly_dividends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    portfolio_item_id UUID REFERENCES public.portfolio_items(id) ON DELETE CASCADE NOT NULL,
    year INTEGER NOT NULL,
    month_1 NUMERIC DEFAULT 0,
    month_2 NUMERIC DEFAULT 0,
    month_3 NUMERIC DEFAULT 0,
    month_4 NUMERIC DEFAULT 0,
    month_5 NUMERIC DEFAULT 0,
    month_6 NUMERIC DEFAULT 0,
    month_7 NUMERIC DEFAULT 0,
    month_8 NUMERIC DEFAULT 0,
    month_9 NUMERIC DEFAULT 0,
    month_10 NUMERIC DEFAULT 0,
    month_11 NUMERIC DEFAULT 0,
    month_12 NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(portfolio_item_id, year)
);

-- =====================================================
-- Row Level Security (RLS) 설정
-- =====================================================

-- Profiles 테이블 RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles 정책: 사용자는 자신의 프로필만 조회 가능
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Profiles 정책: 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Portfolio Items 테이블 RLS 활성화
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Portfolio 정책: 사용자는 자신의 포트폴리오만 조회
CREATE POLICY "Users can view own portfolio" ON public.portfolio_items
    FOR SELECT USING (auth.uid() = user_id);

-- Portfolio 정책: 사용자는 자신의 포트폴리오만 추가
CREATE POLICY "Users can insert own portfolio" ON public.portfolio_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Portfolio 정책: 사용자는 자신의 포트폴리오만 수정
CREATE POLICY "Users can update own portfolio" ON public.portfolio_items
    FOR UPDATE USING (auth.uid() = user_id);

-- Portfolio 정책: 사용자는 자신의 포트폴리오만 삭제
CREATE POLICY "Users can delete own portfolio" ON public.portfolio_items
    FOR DELETE USING (auth.uid() = user_id);

-- Yearly Dividends 테이블 RLS 활성화
ALTER TABLE public.yearly_dividends ENABLE ROW LEVEL SECURITY;

-- Yearly Dividends 정책: 사용자는 자신의 배당 데이터만 조회
CREATE POLICY "Users can view own dividends" ON public.yearly_dividends
    FOR SELECT USING (auth.uid() = user_id);

-- Yearly Dividends 정책: 사용자는 자신의 배당 데이터만 추가
CREATE POLICY "Users can insert own dividends" ON public.yearly_dividends
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Yearly Dividends 정책: 사용자는 자신의 배당 데이터만 수정
CREATE POLICY "Users can update own dividends" ON public.yearly_dividends
    FOR UPDATE USING (auth.uid() = user_id);

-- Yearly Dividends 정책: 사용자는 자신의 배당 데이터만 삭제
CREATE POLICY "Users can delete own dividends" ON public.yearly_dividends
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 트리거: 자동으로 Profile 생성
-- =====================================================

-- 새 사용자가 가입하면 자동으로 profiles 테이블에 레코드 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 인덱스 생성 (성능 최적화)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_portfolio_items_user_id ON public.portfolio_items(user_id);
CREATE INDEX IF NOT EXISTS idx_yearly_dividends_user_id ON public.yearly_dividends(user_id);
CREATE INDEX IF NOT EXISTS idx_yearly_dividends_portfolio_item_id ON public.yearly_dividends(portfolio_item_id);
CREATE INDEX IF NOT EXISTS idx_yearly_dividends_year ON public.yearly_dividends(year);

-- =====================================================
-- 완료!
-- =====================================================
-- 스크립트 실행이 완료되었습니다.
-- 이제 Google OAuth를 설정하세요:
-- 1. Authentication > Providers > Google
-- 2. Enabled 체크
-- 3. Client ID와 Client Secret 입력
-- =====================================================
