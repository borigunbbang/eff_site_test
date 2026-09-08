# SFX Library

효과음 정리 사이트. eff / foley / ambi 세 카테고리로 효과음 메타데이터를 정리해서 보여줍니다.

🔗 **Live**: https://eff-site-test.vercel.app

## 스택

- **프론트엔드**: [Astro](https://astro.build) (SSR)
- **백엔드/DB**: [Supabase](https://supabase.com) (Postgres + Row Level Security)
- **배포**: [Vercel](https://vercel.com) — `main` 브랜치에 푸시하면 자동 재배포

## 로컬 실행

```bash
npm install
```

`.env.local` 파일을 만들고 Supabase 프로젝트의 URL/anon key를 채워주세요 (`.env.example` 참고):

```
PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

```bash
npm run dev
```

브라우저에서 http://localhost:4321 접속.

빌드:

```bash
npm run build
npm run preview
```

## 구조

- `supabase/migration.sql` — DB 스키마(`categories`, `sfx` 테이블) + RLS 정책 + 초기 데이터. Supabase SQL Editor에서 실행
- `src/lib/supabase.js` — Supabase 클라이언트 (env var로 접속 정보 주입, WebSocket polyfill 포함)
- `src/data/categories.js`, `src/data/sfx.js` — DB 조회 헬퍼 함수
- `src/layouts/Layout.astro` — 공통 레이아웃 + SEO용 meta 태그
- `src/components/SfxCard.astro` — 효과음 카드 컴포넌트
- `src/pages/index.astro` — 홈 (카테고리별 미리보기)
- `src/pages/[category].astro` — 카테고리별 전체 목록 페이지 (`/eff`, `/foley`, `/ambi`)

## 콘텐츠 관리

관리자 UI는 따로 없습니다. Supabase 대시보드 → SQL Editor 또는 Table Editor에서 `categories`/`sfx` 테이블을 직접 편집합니다.

## 보안

- 비밀 키는 전부 환경변수로 분리 (`.env.local`은 git 추적 제외, Vercel은 대시보드 Environment Variables에 등록)
- RLS 활성화 — anon 키로는 조회(SELECT)만 가능, 쓰기(INSERT/UPDATE/DELETE)는 차단됨

## 다음 단계 후보

- 실제 오디오 파일 업로드/재생 (Supabase Storage)
- 관리자 페이지(CRUD UI) + 인증
- 커스텀 도메인 연결
