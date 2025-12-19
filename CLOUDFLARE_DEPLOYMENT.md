# Cloudflare Pages Deployment Configuration

## Project Information
- Project Name: finance-dashboard
- GitHub Repository: korbill73/dividend-calculator
- Branch: main

## Build Settings
```
Framework preset: Next.js
Build command: npm run build
Build output directory: out
Root directory: /
Node version: 18
```

## Environment Variables
Add these in Cloudflare Pages dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Deployment Steps

### Method 1: GitHub Integration (Recommended)
1. Go to https://dash.cloudflare.com
2. Navigate to "Workers & Pages"
3. Click "Create application" > "Pages" > "Connect to Git"
4. Select repository: korbill73/dividend-calculator
5. Configure build settings (see above)
6. Add environment variables
7. Click "Save and Deploy"

### Method 2: CLI Deployment
```powershell
# Stop dev server first (Ctrl+C in terminal)
npm run build
npx wrangler pages deploy .next --project-name=finance-dashboard
```

## Auto Deployment
Once connected to GitHub, Cloudflare Pages will automatically deploy on every push to main branch.

## Deployment URL
- Production: https://finance-dashboard.pages.dev
- Or custom domain if configured

## Notes
- Make sure dev server is stopped before building
- Build may take 2-5 minutes
- Check build logs for any errors
