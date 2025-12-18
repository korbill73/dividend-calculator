# 🚀 Supabase 설정 가이드

이 가이드를 따라 Supabase를 설정하고 Google 로그인을 활성화하세요.

---

## 📋 Step 1: Supabase 프로젝트 생성

1. **Supabase 접속**
   - https://supabase.com 방문
   - "Start your project" 클릭
   - GitHub로 로그인

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - Project name: `finance-dashboard` (원하는 이름)
   - Database Password: 안전한 비밀번호 입력 (저장해두세요!)
   - Region: `Northeast Asia (Seoul)` 선택
   - "Create new project" 클릭
   - ⏳ 약 2분 정도 기다리세요

---

## 📋 Step 2: 환경변수 설정

1. **API Keys 복사**
   - Supabase 프로젝트 대시보드에서
   - 왼쪽 메뉴 → `Settings` (⚙️) → `API` 클릭
   - 두 가지 값을 찾으세요:
     - `Project URL`
     - `anon` `public` key

2. **.env.local 파일 생성**
   - 프로젝트 루트에 `.env.local` 파일 생성
   - 아래 내용 복사하고 값 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=여기에_Project_URL_붙여넣기
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_key_붙여넣기
```

**예시:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzOTU4NjQwMCwiZXhwIjoxOTU1MTYyNDAwfQ.abc123def456
```

---

## 📋 Step 3: 데이터베이스 스키마 생성

1. **SQL Editor 열기**
   - 왼쪽 메뉴 → `SQL Editor` 클릭
   - "New query" 버튼 클릭

2. **SQL 스크립트 실행**
   - `supabase/schema.sql` 파일 열기
   - 전체 내용 복사
   - SQL Editor에 붙여넣기
   - **"RUN"** 버튼 클릭 (또는 Ctrl+Enter)
   - ✅ "Success. No rows returned" 메시지 확인

3. **테이블 확인**
   - 왼쪽 메뉴 → `Table Editor` 클릭
   - 다음 테이블들이 생성되었는지 확인:
     - `profiles`
     - `portfolio_items`
     - `yearly_dividends`

---

## 📋 Step 4: Google OAuth 설정

### A. Google Cloud Console 설정

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com 방문
   - 프로젝트 선택 또는 새로 만들기

2. **OAuth 동의 화면 설정**
   - 왼쪽 메뉴 → `APIs & Services` → `OAuth consent screen`
   - User Type: `External` 선택 → "CREATE" 클릭
   - App name: `FinDash` 입력
   - User support email: 본인 이메일
   - Developer contact: 본인 이메일
   - "SAVE AND CONTINUE" 클릭
   - Scopes → "SAVE AND CONTINUE" (건너뛰기)
   - Test users → "SAVE AND CONTINUE" (건너뛰기)

3. **OAuth 클라이언트 ID 생성**
   - `Credentials` 메뉴 클릭
   - "CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: `Web application`
   - Name: `FinDash Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:3000` 추가
     - (나중에 배포 URL도 추가)
   - Authorized redirect URIs:
     - 아래 URL을 입력하세요 (Supabase URL 사용):

```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

   예시: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

   - "CREATE" 클릭
   - **Client ID**와 **Client secret** 복사 (중요!)

### B. Supabase에 Google OAuth 연결

1. **Authentication 설정**
   - Supabase 대시보드 → `Authentication` → `Providers`
   - `Google` 찾기 → 토글 켜기 (Enabled)

2. **Client ID와 Secret 입력**
   - Client ID: Google에서 복사한 Client ID 붙여넣기
   - Client Secret: Google에서 복사한 Client secret 붙여넣기
   - "Save" 클릭

3. **Redirect URL 확인**
   - Supabase가 제공하는 Callback URL 확인:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - 이 URL이 Google Cloud Console의 Authorized redirect URIs에 있는지 재확인

---

## 📋 Step 5: 테스트

1. **개발 서버 재시작**
```bash
npm run dev
```

2. **로그인 테스트**
   - http://localhost:3000/login 접속
   - "Google로 로그인" 버튼 클릭
   - Google 계정 선택
   - ✅ 로그인 성공 후 대시보드로 이동

3. **데이터 확인**
   - Supabase 대시보드 → `Table Editor` → `profiles`
   - 방금 로그인한 계정 정보 확인

---

## ✅ 완료!

모든 설정이 완료되었습니다! 이제:

- ✅ Google 로그인 가능
- ✅ 사용자별 데이터 분리
- ✅ 모든 기기에서 동기화
- ✅ 안전한 데이터 저장

---

## 🔧 문제 해결

### 로그인 버튼을 눌렀는데 아무 반응이 없어요
- `.env.local` 파일을 확인하세요
- 개발 서버를 재시작하세요 (`npm run dev`)

### "Invalid redirect URL" 오류
- Google Cloud Console에서 Authorized redirect URIs 확인
- Supabase Callback URL과 정확히 일치하는지 확인

### SQL 실행 시 오류
- 기존 테이블이 있다면 먼저 삭제:
```sql
DROP TABLE IF EXISTS yearly_dividends CASCADE;
DROP TABLE IF EXISTS portfolio_items CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```
- 그 다음 schema.sql 다시 실행

### 로그인은 되는데 데이터가 안 보여요
- 아직 데이터를 입력하지 않았기 때문입니다
- Dividend Tracker 페이지에서 데이터를 입력하면 자동으로 DB에 저장됩니다

---

## 📞 도움이 필요하면

문제가 발생하면 다음 정보를 확인하세요:
1. 브라우저 개발자 도구 콘솔 (F12)
2. Supabase 대시보드 → Logs
3. 터미널 오류 메시지

Happy coding! 🎉
