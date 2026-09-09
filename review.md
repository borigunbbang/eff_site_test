# AIFFEL Campus Code Peer Review Templete
- 코더 : 이예림
- 리뷰어 : 이지연


# PRT(Peer Review Template)
[ ]  **1. 주어진 문제를 해결하는 완성된 코드가 제출되었나요?**

루브릭 세 항목 중 **보안만 충족**으로 봤습니다.

**(1) 서비스가 직관적이고, 의도한 대로 잘 동작합니다 — 미충족**

카드를 눌렀을 때 아무 일도 일어나지 않습니다.

- 홈에서 카드를 누르면 그 카테고리 목록으로만 넘어갑니다
- 목록 페이지(`[category].astro`)의 카드는 링크조차 아닙니다

```astro
<div id={`sfx-${item.id}`}>
  <SfxCard {...item} />
</div>
```

음원 파일이 아직 없는 것은 리뷰 대상에서 뺐습니다. 저작권 확인이 끝나지 않아 올리지 않으신 것으로 들었고, 그건 코드의 문제가 아니라고 봤습니다.

다만 **음원과 무관하게** 목록에서 카드를 눌러도 다음 화면이 없다는 점은 남습니다.

**(2) 실제로 동작하는 백엔드 동작이 의도한 것과 일치합니다 — 미충족**

DB에서 **읽어오는** 것은 확인했습니다.

```js
const [sfxData, CATEGORIES] = await Promise.all([getAllSfx(), getCategories()]);
```

조회에 실패하면 에러를 던져 페이지가 뜨지 않게 되어 있고(`if (error) throw error;`), 페이지는 정상으로 뜹니다. 그래서 읽기는 동작합니다.

그런데 **앱에서 DB로 쓰는 길이 없습니다.** README에도 그렇게 적혀 있습니다.

> 관리자 UI는 따로 없습니다. Supabase 대시보드 → SQL Editor 또는 Table Editor에서 `categories`/`sfx` 테이블을 직접 편집합니다.

과제 갈래 B가 요구한 제출물은 **"새로고침해도 데이터가 남는" 장면**입니다. 앱에서 저장하는 기능이 없으면 그 장면을 만들 수 없습니다. 지금은 데이터를 넣고 고치는 일이 앱 밖(대시보드)에서 일어나고, 로그인도 없어서 "누가 썼는가"라는 개념 자체가 없습니다.

읽기만으로는 의도와 일치한다고 보기 어렵다고 판단했습니다.

**(3) 제출물에 보안상의 문제가 없는지 잘 검토되어 있고, 실제로 문제가 없어야 합니다 — 충족**

접속 정보는 전부 환경변수이고 `.env.example` 만 올라가 있습니다.

```
# environment variables
.env
.env.local
.env.production
!.env.example
```

anon key는 브라우저에 노출되는 값이라 숨길 수 없는데, DB 쪽에서 권한으로 막아두었습니다.

```sql
alter table categories enable row level security;
alter table sfx enable row level security;

create policy "public read categories" on categories
  for select using (true);

create policy "public read sfx" on sfx
  for select using (true);
```

`for select` 정책만 있고 insert/update/delete 정책이 없습니다. RLS가 켜진 테이블은 **정책이 없는 동작이 기본적으로 거부**되므로, 결과적으로 조회만 허용되고 쓰기는 차단됩니다.

"키를 숨긴다"가 아니라 "키가 공개돼도 쓰기는 안 된다"로 접근한 점이 정확하다고 봤습니다.

[x]  **2. 핵심적이거나 복잡하고 이해하기 어려운 부분에 작성된 설명을 보고 해당 코드가 잘 이해되었나요?**

가장 이해하기 어려운 부분은 `src/lib/supabase.js` 의 WebSocket polyfill입니다. Realtime을 쓰지도 않는데 왜 `ws` 패키지가 필요한지는 코드만 봐서는 알 수 없는데, 주석이 **원인 → 증상 → 대응** 순서로 적혀 있어 바로 이해됐습니다.

```js
// Node.js < 22 서버리스 환경에는 전역 WebSocket이 없어서,
// Supabase 클라이언트의 Realtime 초기화가 에러를 던짐 (기능 자체는 안 써도 발생).
// ws 패키지로 polyfill 해서 방지.
if (typeof globalThis.WebSocket === 'undefined') {
  const { default: WebSocket } = await import('ws');
  globalThis.WebSocket = WebSocket;
}
```

`(기능 자체는 안 써도 발생)` 이 한 줄 덕분에 "안 쓰는 기능인데 왜 문제가 되지?"라는 의문이 남지 않았습니다.

환경변수 누락도 조용히 넘어가지 않고, 무엇을 확인해야 하는지까지 알려주고 멈춥니다.

```js
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY. .env(.local) 파일을 확인하세요.'
  );
}
```

[x]  **3. 에러가 난 부분을 디버깅하여 "문제를 해결한 기록"을 남겼나요? 또는 "새로운 시도 및 추가 실험"을 해봤나요?**

별도 문서는 없지만 커밋 히스토리에 **무엇이 왜 문제였고 어떻게 고쳤는지**가 남아 있습니다.

```
6e7d3b1 fix: Supabase 클라이언트 WebSocket polyfill 추가 (Vercel 런타임 에러 수정)
32829ab fix: Vercel Node.js 런타임을 20.x로 고정 (18.x deprecated 에러 수정)
```

둘 다 **로컬에서는 안 나고 배포 환경에서만 나는 에러**입니다. 원인이 코드가 아니라 실행 환경에 있어 찾기 까다로운 종류인데, 커밋 메시지에 원인이 함께 적혀 있어 나중에 같은 문제를 만나면 찾을 수 있습니다.

[ ]  **4. 회고를 잘 작성했나요?**

회고에 해당하는 내용은 찾지 못했습니다. `README.md` 의 「다음 단계 후보」는 앞으로 할 일 목록이지 배운 점·아쉬운 점의 회고는 아닙니다.

3번에서 본 배포 환경 에러 두 건을 겪으며 알게 된 것을 몇 줄만 적어두면 그대로 회고가 될 것 같습니다.

(회고를 README가 아닌 다른 곳에 제출하셨다면 제가 못 본 것이니 알려주세요.)

[x]  **5. 코드가 간결하고 효율적인가요?**

PEP8은 파이썬 스타일 가이드라 이 프로젝트(JavaScript / Astro)에는 해당하지 않아, 모듈화와 중복 최소화를 기준으로 봤습니다.

DB 조회가 페이지에서 분리되어 있습니다. 페이지 파일에 Supabase 호출이 섞여 있지 않고 `src/data/` 의 함수를 부르기만 합니다.

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

`category:category_slug` 로 컬럼 이름을 조회 단계에서 바꿔주기 때문에 컴포넌트는 DB 컬럼명을 몰라도 됩니다. DB 스키마와 화면이 분리되는 지점입니다.

카드 UI는 `SfxCard` 하나로 홈과 카테고리 페이지가 함께 씁니다. 헤더·푸터·색상 변수도 `Layout.astro` 한 곳에 모여 있습니다.


# 참고 링크 및 코드 개선

## 1.코드 리뷰 시 참고한 링크가 있다면 링크와 간략한 설명을 첨부합니다.

- https://eff-site-test.vercel.app — 배포된 사이트. 코드만 보지 않고 실제로 눌러보며 확인했습니다.

## 2.코드 리뷰를 통해 개선을 제안할 코드가 있다면 코드와 간략한 설명을 첨부합니다.

### (1) 앱에서 저장하는 기능이 하나는 있어야 합니다 — 가장 중요

과제가 요구한 "새로고침해도 데이터가 남는" 장면을 만들려면, 앱 화면에서 DB에 쓰는 경로가 필요합니다. 지금은 읽기 정책만 있어서 코드만 고쳐도 안 되고, RLS 정책도 함께 열어야 합니다.

가장 작게 붙일 수 있는 건 효과음 등록 폼 하나입니다. 그러면 이 흐름이 만들어집니다.

```
화면에서 입력 → DB에 저장 → 새로고침 → 그대로 남아 있음
```

### (2) 카드를 눌렀을 때 할 일이 있어야 합니다

목록 페이지의 카드는 링크가 아니라 눌러도 반응이 없습니다. 음원이 없어도 만들 수 있는 것이 있습니다 — 카드를 누르면 그 효과음 하나의 상세 화면(이름·카테고리·설명)으로 가게만 해도 "의도한 대로 동작한다"에 가까워집니다. 음원은 나중에 그 화면에 얹으면 됩니다.

### (3) `astro.config.mjs` 의 `site` 가 아직 예시 주소입니다

```js
site: 'https://example.com',
```

`Layout.astro` 가 이 값으로 canonical 주소를 만듭니다.

```astro
<link rel="canonical" href={new URL(Astro.url.pathname, Astro.site)} />
```

그래서 배포된 `/foley` 페이지의 canonical이 실제로 이렇게 나옵니다. (브라우저에서 확인한 값입니다)

```
https://example.com/foley
```

화면에는 이상이 없어서 눈에 띄지 않지만, 검색엔진에는 "이 페이지의 원본은 example.com"이라고 알려주는 셈입니다.

### (4) `src/data/sfx.json` 은 아무도 참조하지 않습니다

Supabase로 옮기기 전의 목업 데이터로 보입니다. 참조하는 곳을 찾아봤는데 없었습니다.

```bash
grep -rn "sfx.json" src/ astro.config.mjs package.json
# (결과 없음)
```

같은 데이터가 `migration.sql` 에도 있어서 나중에 어느 쪽이 진짜인지 헷갈릴 수 있습니다.

### (5) `src/pages/404.astro` 가 없습니다

`[category].astro` 는 없는 카테고리로 들어오면 `/404` 로 보냅니다.

```astro
} catch {
  return Astro.redirect('/404');
}
```

그런데 `src/pages/` 에는 `index.astro` 와 `[category].astro` 뿐이라 갈 페이지가 저장소에 없습니다.


# 총평

**구조는 잘 잡혀 있는데, 백엔드가 읽기 한 방향만 붙어 있습니다.**

DB 스키마를 만들고, 조회 함수를 분리하고, RLS로 권한을 막아둔 부분은 그대로 다음 단계에 쓸 수 있는 상태입니다. 특히 보안은 anon key를 숨기려 하지 않고 권한으로 막은 점이 정확했습니다. 주석도 "무엇을 하는지"가 아니라 "왜 필요한지"를 적어두어서, 처음 보는 사람이 읽어도 막히지 않았습니다.

다만 지금 화면에서 할 수 있는 일이 없습니다. 카드를 눌러도 반응이 없고, 데이터를 넣고 고치는 일은 Supabase 대시보드에서 일어납니다. (음원이 아직 없는 것은 저작권 확인 중이라 들었으므로 리뷰에서 빼고 봤습니다.) 과제가 확인하려는 것이 "백엔드가 실제로 도는 것을 내 손으로 경험했는가"이고 제출물이 "새로고침해도 데이터가 남는 장면"인데, 저장 경로가 없으면 그 장면을 만들 수 없습니다.

그래서 1번은 미충족으로 봤습니다. 읽기가 되는 것까지 만들어 두셨으니, **저장 기능 하나만 붙이면** 나머지는 이미 준비되어 있다고 생각합니다.
