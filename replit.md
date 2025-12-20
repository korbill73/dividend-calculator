# FinDash - Personal Finance Dashboard

## Overview

FinDash is a personal finance management application focused on dividend tracking and asset simulation. The application allows users to manage their dividend stock portfolio, track monthly/yearly dividend income, and run asset growth simulations with different investment scenarios. Built with Next.js 14 and deployed as a static export to Cloudflare Pages.

**Core Features:**
- Dividend portfolio management with monthly dividend tracking per stock
- Year-over-year dividend comparison and statistics
- Asset growth simulation with conservative/moderate/aggressive scenarios
- Google OAuth authentication via Supabase
- Data persistence with Supabase (authenticated users) or local storage (guests)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **Rendering**: Static export (`output: 'export'`) for Cloudflare Pages deployment
- **Styling**: Tailwind CSS with CSS variables for theming (dark mode default)
- **UI Components**: Custom components built on Radix UI primitives (Label, Slot)
- **Charts**: Recharts for data visualization (line charts, bar charts)
- **Data Tables**: TanStack React Table for editable grid interfaces

### State Management
- **Client State**: Zustand with persist middleware for local storage backup
- **Store Structure**: Single `useFinanceStore` managing portfolio items, simulation settings, and history
- **Data Model**: 
  - `StockItem`: Stock with yearly dividend arrays (`yearlyDividends: { [year]: number[12] }`)
  - `SimulatorSettings`: Accounts, scenarios, contribution settings, date range

### Authentication & Data Layer
- **Auth Provider**: Supabase Auth with Google OAuth
- **Auth Flow**: Custom `AuthProvider` context wrapping the app
- **Callback Handling**: Dedicated `/auth/callback` route for OAuth redirect
- **Data Access Pattern**: 
  - Authenticated users: Data synced to Supabase
  - Guest users: Read-only sample data, local storage only

### Routing Structure
- `/` - Dashboard with portfolio summary
- `/dividends` - Dividend matrix management
- `/dividends/history` - Year-over-year dividend statistics
- `/simulation` - Asset growth simulation
- `/settings` - Data import/export, Supabase sync
- `/login` - Authentication page
- `/manual` - User documentation

### Component Organization
- `components/ui/` - Reusable UI primitives (Button, Card, Input, Table, etc.)
- `components/layout/` - Sidebar (desktop) and MobileNav (mobile bottom navigation)
- `components/auth/` - AuthProvider context
- `components/dividends/` - Dividend-specific components (Matrix, Grid, History)
- `components/simulation/` - Simulation dashboard and settings
- `components/settings/` - Settings page with backup/restore

### Mobile Responsiveness
- **Breakpoint**: `md:` (768px) separates mobile and desktop layouts
- **Mobile Navigation**: Bottom navigation bar with 5 main menu items
- **Desktop Navigation**: Left sidebar (hidden on mobile)
- **Layout Strategy**: Cards stack vertically on mobile, grid on desktop
- **Text Sizes**: `text-[10px]` for mobile, scales up on desktop
- **Charts**: Responsive height (200px mobile, 300-350px desktop)

## External Dependencies

### Supabase (Backend-as-a-Service)
- **Purpose**: Authentication and database storage
- **Auth Method**: Google OAuth provider
- **Environment Variables Required**:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key
- **Database Tables**: `profiles`, `portfolio_items`, `yearly_dividends`, `user_sim_settings`, `user_history`, `user_account_history` (defined in `lib/supabase.ts`)

### Cloudflare Pages (Deployment)
- **Build Output**: Static export to `out` directory
- **Node Version**: 18
- **Auto-deploy**: Connected to GitHub main branch

### Key NPM Packages
- `@supabase/supabase-js` - Supabase client
- `@supabase/auth-helpers-nextjs` - Next.js auth integration
- `zustand` - State management
- `recharts` - Chart visualization
- `@tanstack/react-table` - Data table with editing
- `@radix-ui/*` - Accessible UI primitives
- `lucide-react` - Icon library