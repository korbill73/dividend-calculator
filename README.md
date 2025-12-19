# 💰 FinDash - Personal Finance Dashboard

개인 자산 및 배당금 관리 플랫폼

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
[![Deployment](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange)](https://pages.cloudflare.com/)

---

## ✨ 주요 기능

### 📊 배당 관리 (Dividend Tracker)
- **포트폴리오 관리**: 배당주 종목 추가/수정/삭제
- **월별 배당금 입력**: 12개월 배당금 관리
- **연도별 데이터**: 각 연도의 배당금을 독립적으로 저장
- **자동 집계**: 월별/연간 배당금 자동 계산
- **쉼표 포맷팅**: 금액 입력 시 자동 포맷팅

### 📈 배당 통계 (Dividend History)
- **연도별 비교**: 연도별 배당금 추이 그래프
- **누적 배당금**: 시간에 따른 배당금 누적 분석
- **상세 통계**: 연도별 수익률, 전년 대비 증감율
- **시각화**: 막대 그래프, 라인 차트

### 💰 자산 시뮬레이션 (Asset Simulation)
- **미래 예측**: 저축과 수익률 기반 자산 시뮬레이션
- **시나리오 비교**: 보수적/중도적/공격적 시나리오
- **기간 설정**: 시작~종료 연도 설정
- **월별 기여금**: 정기 적립금 설정

### 🔐 사용자 인증
- **Google OAuth**: 구글 계정으로 로그인
- **사용자별 데이터**: 완벽한 데이터 분리
- **모든 기기 동기화**: 언제 어디서나 접근
- **안전한 저장**: Supabase RLS 보안

---

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone https://github.com/YOUR_USERNAME/finance-dashboard.git
cd finance-dashboard
```

### 2. 패키지 설치

```bash
npm install
```

### 3. Supabase 설정

**자세한 가이드**: [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) 참고

간단 요약:
1. https://supabase.com 에서 프로젝트 생성
2. `.env.local` 파일 생성:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
3. `supabase/schema.sql` 실행
4. Google OAuth 설정

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속

---

## 📁 프로젝트 구조

```
finance-dashboard/
├── app/                          # Next.js App Router
│   ├── login/                    # 로그인 페이지
│   ├── auth/callback/            # OAuth 콜백
│   ├── dividends/                # 배당 관리
│   │   └── history/              # 배당 통계
│   ├── simulation/               # 자산 시뮬레이션
│   └── settings/                 # 설정
├── components/
│   ├── auth/                     # 인증 컴포넌트
│   ├── dividends/                # 배당 관련 컴포넌트
│   ├── simulation/               # 시뮬레이션 컴포넌트
│   ├── layout/                   # 레이아웃 (Sidebar 등)
│   └── ui/                       # shadcn/ui 컴포넌트
├── lib/
│   ├── supabase.ts               # Supabase 클라이언트
│   └── utils.ts                  # 유틸리티 함수
├── store/
│   └── useFinanceStore.ts        # Zustand 상태 관리
├── supabase/
│   └── schema.sql                # 데이터베이스 스키마
└── .env.local                    # 환경변수 (직접 생성)
```

---

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **Backend**: Supabase (Auth + PostgreSQL)
- **Charts**: Recharts
- **Authentication**: Google OAuth 2.0

---

## 📊 데이터베이스 스키마

### profiles
- 사용자 프로필 정보

### portfolio_items
- 배당주 종목 정보
- 종목명, 수량, 현재가, 배당수익률 등

### yearly_dividends
- 연도별 월별 배당금
- 각 종목의 12개월 배당금 저장

**RLS (Row Level Security)** 적용으로 사용자는 자신의 데이터만 접근 가능

---

## 🎨 주요 화면

### 1. 로그인 페이지
- Google OAuth 로그인

### 2. 배당 관리
- 포트폴리오 테이블
- 월별 배당금 입력
- 연도별 데이터 관리

### 3. 배당 통계
- 연도별 배당금 비교
- 누적 배당금 추이
- 상세 통계 테이블

### 4. 자산 시뮬레이션
- 미래 자산 예측
- 시나리오별 비교

---

## 🔒 보안

- **Row Level Security (RLS)**: 사용자별 데이터 완벽 분리
- **환경변수**: 민감 정보는 `.env.local`에 저장
- **OAuth 2.0**: 안전한 Google 로그인
- **HTTPS**: Supabase 통신 암호화

---

## 📝 라이선스

MIT License

---

## 👨‍💻 개발자

**Your Name**
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)

---

## 🙏 감사의 말

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

---

## 📞 문의

이슈가 있으시면 [GitHub Issues](https://github.com/YOUR_USERNAME/finance-dashboard/issues)에 등록해주세요.

---

Made with ❤️ using Next.js and Supabase
