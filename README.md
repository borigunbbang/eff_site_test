# SFX Library (Astro 임시 사이트)

효과음 정리 사이트의 프로토타입입니다. eff / foley / ambi 세 카테고리를 목업 데이터(`src/data/sfx.json`)로 렌더링합니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:4321 접속하면 됩니다.

빌드(정적 파일 생성):

```bash
npm run build
npm run preview
```

## 구조

- `src/data/sfx.json` — 효과음 목업 데이터 (id, name, category, image)
- `src/data/categories.js` — 카테고리 메타 정보 (label, description)
- `src/layouts/Layout.astro` — 공통 레이아웃 + SEO용 meta 태그 (title, description, canonical, OG)
- `src/components/SfxCard.astro` — 효과음 카드 컴포넌트
- `src/pages/index.astro` — 홈 (카테고리별 미리보기)
- `src/pages/[category].astro` — 카테고리별 전체 목록 페이지 (`/eff`, `/foley`, `/ambi`)를 `getStaticPaths`로 동적 생성

## 다음 단계 (백엔드 연동 시)

지금은 `sfx.json`을 정적으로 import하고 있어서, 나중에 실제 백엔드/DB를 붙일 때는 `sfx.json` import 부분을 API fetch로 교체하면 됩니다 (예: `[category].astro`의 `sfxData` 로딩부).

SEO를 더 강화하려면:

- `@astrojs/sitemap` 통합 추가
- `public/robots.txt` 추가
- 실제 오디오/이미지 파일 연결 시 `alt` 텍스트 및 구조화 데이터(JSON-LD) 보강
