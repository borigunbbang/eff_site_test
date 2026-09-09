# AIFFEL Campus Code Peer Review Templete
- 코더 : 이예림
- 리뷰어 : 이지연


# PRT(Peer Review Template)
[x]  **1. 주어진 문제를 해결하는 완성된 코드가 제출되었나요?**

루브릭 세 항목 모두 충족한다고 판단했습니다.

**(1) 프론트엔드와 백엔드가 적절하게 만들어져 동작합니다.**

Astro(SSR) 프론트엔드 + Supabase(Postgres) 백엔드로 나뉘어 있고, 페이지는 DB에서 읽은 값으로 그려집니다.
`src/pages/index.astro` 에서 카테고리와 효과음을 각각 조회해 화면을 구성합니다.

```astro
---
import { getAllSfx } from '../data/sfx.js';
import { getCategories } from '../data/categories.js';

const [sfxData, CATEGORIES] = await Promise.all([getAllSfx(), getCategories()]);
---
```

카테고리 목록이 하드코딩이 아니라 DB에서 오기 때문에, 카테고리를 추가하면 코드 수정 없이 화면에 반영됩니다.

**(2) 실제 동작하는 백엔드 동작이 의도한 것과 일치합니다.**

배포 주소(https://eff-site-test.vercel.app)에 직접 들어가 확인했습니다.

- 홈 `/` — Effect / Foley / Ambience 세 섹션과 카드가 모두 렌더링됨
- `/foley` — 카드 3개 표시, `<title>`이 `Foley 효과음 | SFX Library` 로 정상 출력

`migration.sql` 에 넣은 초기 데이터 9건이 그대로 화면에 나오므로, DB 조회가 실제로 동작합니다.

**(3) 제출물에 보안상의 문제가 없는지 잘 검토되어 있고, 실제로 문제가 없어야 합니다.**

접속 정보는 전부 환경변수이고, `.env.example` 만 올라가 있습니다. `.gitignore` 에 `.env` 계열이 제외되어 있습니다.

```
# environment variables
.env
.env.local
.env.production
!.env.example
```

브라우저에 노출되는 anon key로 쓰기가 되지 않도록 DB 쪽에서 RLS로 막아둔 점이 핵심입니다.

```sql
-- 공개 읽기 전용: RLS 켜고 anon 역할에는 select만 허용
alter table categories enable row level security;
alter table sfx enable row level security;

create policy "public read categories" on categories
  for select using (true);

create policy "public read sfx" on sfx
  for select using (true);
```

`for select` 정책만 있고 insert/update/delete 정책이 없습니다. RLS가 켜진 테이블은 **정책이 없는 동작은 기본적으로 거부**되므로, 결과적으로 조회만 허용되고 쓰기는 차단됩니다. 키를 숨기는 방식이 아니라 권한 자체를 막는 방식이라 올바른 접근이라고 봤습니다.

[x]  **2. 핵심적이거나 복잡하고 이해하기 어려운 부분에 작성된 설명을 보고 해당 코드가 잘 이해되었나요?**

가장 이해하기 어려울 수 있는 부분은 `src/lib/supabase.js` 의 WebSocket polyfill입니다. Realtime 기능을 쓰지도 않는데 왜 `ws` 패키지가 필요한지는 코드만 봐서는 알 수 없는데, 주석이 **원인 → 증상 → 대응** 순서로 적혀 있어 바로 이해됐습니다.

```js
// Node.js < 22 서버리스 환경에는 전역 WebSocket이 없어서,
// Supabase 클라이언트의 Realtime 초기화가 에러를 던짐 (기능 자체는 안 써도 발생).
// ws 패키지로 polyfill 해서 방지.
if (typeof globalThis.WebSocket === 'undefined') {
  const { default: WebSocket } = await import('ws');
  globalThis.WebSocket = WebSocket;
}
```

특히 `(기능 자체는 안 써도 발생)` 이 한 줄 덕분에 "안 쓰는 기능인데 왜 문제가 되지?" 라는 의문이 남지 않았습니다.

환경변수 누락도 조용히 넘어가지 않고, 무엇을 확인해야 하는지까지 알려주고 멈춥니다.

```js
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY. .env(.local) 파일을 확인하세요.'
  );
}
```

또 `README.md` 의 「구조」 절에 파일별 역할이 한 줄씩 정리되어 있어서, 처음 보는 사람도 어느 파일부터 열어야 할지 알 수 있었습니다.

[x]  **3. 에러가 난 부분을 디버깅하여 "문제를 해결한 기록"을 남겼나요? 또는 "새로운 시도 및 추가 실험"을 해봤나요?**

별도의 디버깅 문서는 없지만, 커밋 히스토리에 **무엇이 왜 문제였고 어떻게 고쳤는지**가 남아 있습니다.

```
f5621f5 docs: README를 실제 Supabase+Vercel 구조에 맞게 업데이트, 배포 링크 추가
6e7d3b1 fix: Supabase 클라이언트 WebSocket polyfill 추가 (Vercel 런타임 에러 수정)
32829ab fix: Vercel Node.js 런타임을 20.x로 고정 (18.x deprecated 에러 수정)
5a24400 chore: trigger Vercel deployment
17868ca Supabase 백엔드 연동 + Vercel SSR 배포 설정
f167026 Initial commit: sfx-astro-site
```

두 건 모두 **로컬에서는 안 나고 배포 환경에서만 나는 에러**입니다. 원인이 코드가 아니라 실행 환경에 있어서 찾기 까다로운 종류인데, 커밋 메시지에 원인(`18.x deprecated`, `Vercel 런타임 에러`)이 함께 적혀 있어 나중에 같은 문제를 만나면 바로 찾을 수 있습니다.

해결 결과는 코드에도 남아 있습니다.

```json
"engines": {
  "node": "20.x"
}
```

[ ]  **4. 회고를 잘 작성했나요?**

회고에 해당하는 내용은 찾지 못했습니다.

`README.md` 마지막에 「다음 단계 후보」가 있지만, 이건 앞으로 할 일 목록이지 **배운 점 · 아쉬운 점 · 느낀 점**의 회고는 아닙니다.

```markdown
## 다음 단계 후보

- 실제 오디오 파일 업로드/재생 (Supabase Storage)
- 관리자 페이지(CRUD UI) + 인증
- 커스텀 도메인 연결
```

3번에서 본 배포 환경 에러 두 건을 겪으면서 알게 된 것을 몇 줄만 적어두면 그대로 회고가 될 것 같습니다.

(회고를 README가 아닌 다른 곳에 제출하셨다면 제가 못 본 것이니 알려주세요.)

[x]  **5. 코드가 간결하고 효율적인가요?**

PEP8은 파이썬 스타일 가이드라 이 프로젝트(JavaScript / Astro)에는 해당하지 않아, 모듈화와 중복 최소화를 기준으로 봤습니다.

**DB 조회를 페이지에서 분리했습니다.** 페이지 파일에 Supabase 호출이 섞여 있지 않고, `src/data/` 의 함수를 부르기만 합니다.

```js
// src/data/sfx.js
export async function getSfxByCategory(categorySlug) {
  const { data, error } = await supabase
    .from('sfx')
    .select('id, name, category:category_slug, image')
    .eq('category_slug', categorySlug)
    .order('id', { ascending: true });

  if (error) throw error;
  return data;
}
```

`category:category_slug` 로 컬럼 이름을 조회 단계에서 바꿔주기 때문에, 컴포넌트는 DB 컬럼명을 몰라도 됩니다. DB 스키마와 화면이 분리되는 지점입니다.

**카드 UI는 컴포넌트 하나로 재사용됩니다.** 홈과 카테고리 페이지가 같은 `SfxCard` 를 씁니다.

```astro
<SfxCard {...item} />
```

**레이아웃·전역 스타일도 한 곳에 모여 있습니다.** `Layout.astro` 에 헤더/푸터/색상 변수(`--bg`, `--accent` 등)가 있어서, 각 페이지 스타일은 자기 화면에만 집중합니다.


# 참고 링크 및 코드 개선

## 1.코드 리뷰 시 참고한 링크가 있다면 링크와 간략한 설명을 첨부합니다.

- https://eff-site-test.vercel.app — 배포된 사이트. 코드만 보지 않고 실제로 들어가서 홈과 `/foley` 가 DB 데이터로 그려지는지 확인했습니다.

## 2.코드 리뷰를 통해 개선을 제안할 코드가 있다면 코드와 간략한 설명을 첨부합니다.

### (1) `astro.config.mjs` 의 `site` 가 아직 예시 주소입니다

```js
export default defineConfig({
  site: 'https://example.com',   // ← 배포 주소로 바꾸면 좋겠습니다
  output: 'server',
  adapter: vercel(),
});
```

`Layout.astro` 가 이 값으로 canonical 주소를 만듭니다.

```astro
<link rel="canonical" href={new URL(Astro.url.pathname, Astro.site)} />
```

그래서 실제 배포된 `/foley` 페이지의 canonical이 이렇게 나옵니다. (브라우저에서 확인한 값입니다)

```
https://example.com/foley
```

화면에는 아무 문제가 없어서 눈에 띄지 않지만, 검색엔진에는 "이 페이지의 원본은 example.com" 이라고 알려주는 셈입니다. `site` 를 `https://eff-site-test.vercel.app` 으로 바꾸면 해결됩니다.

### (2) `src/data/sfx.json` 은 지금 아무도 참조하지 않습니다

Supabase로 옮기기 전의 목업 데이터로 보입니다. 저장소 전체에서 참조하는 곳을 찾아봤는데 없었습니다.

```bash
grep -rn "sfx.json" src/ astro.config.mjs package.json
# (결과 없음)
```

같은 데이터가 `migration.sql` 에도 있어서, 나중에 둘 중 어느 쪽이 진짜인지 헷갈릴 수 있습니다. 지워도 될 것 같습니다.

### (3) `src/pages/404.astro` 가 없습니다

`[category].astro` 는 없는 카테고리로 들어오면 `/404` 로 보냅니다.

```astro
let cat;
try {
  cat = await getCategory(category as string);
} catch {
  return Astro.redirect('/404');
}
```

그런데 `src/pages/` 에는 `index.astro` 와 `[category].astro` 뿐이라 `/404` 로 갈 페이지가 저장소에 없습니다. `src/pages/404.astro` 를 하나 만들어두면 사용자가 "홈으로 돌아가기" 라도 누를 수 있을 것 같습니다.


# 총평

**기능이 아니라 구조를 잡아둔 프로젝트**라는 인상을 받았습니다. 화면에 보이는 것은 카드 9개지만, 데이터를 DB로 옮기고 · 조회 함수를 분리하고 · 권한을 RLS로 막아둔 상태라, 다음에 무엇을 붙이든 고쳐야 할 곳이 적습니다. 특히 카테고리를 하드코딩하지 않고 DB에서 읽도록 한 선택이 그렇습니다.

보안 부분은 "키를 숨겼다"가 아니라 "키가 공개돼도 쓰기는 안 된다"로 접근한 점이 정확하다고 느꼈습니다. RLS 정책을 `select` 만 만들어둔 것이 그 근거입니다.

주석도 인상적이었습니다. 특히 WebSocket polyfill 주석은 코드를 읽는 사람이 가질 의문을 미리 알고 답해준 느낌이었습니다. 저는 주석에 "무엇을 하는지"만 적는 편인데, "왜 필요한지"까지 적는 게 이런 차이를 만드는구나 싶었습니다.

아쉬운 점은 회고입니다. 배포 환경에서만 나는 에러를 두 번이나 잡으셨는데, 그 과정이 커밋 메시지 한 줄로만 남아 있습니다. 가장 값진 부분이 가장 짧게 기록된 것 같아 아까웠습니다.
