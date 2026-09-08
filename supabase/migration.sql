-- sfx-astro-site: Supabase 초기 스키마 + 목업 데이터 이관
-- Supabase Dashboard > SQL Editor 에 붙여넣고 실행하세요.

create table if not exists categories (
  slug text primary key,
  label text not null,
  description text not null,
  sort_order int not null default 0
);

create table if not exists sfx (
  id bigint generated always as identity primary key,
  name text not null,
  category_slug text not null references categories(slug) on delete cascade,
  image text, -- 이미지 설명 텍스트 (추후 실제 이미지 URL로 교체 가능)
  created_at timestamptz not null default now()
);

create index if not exists sfx_category_slug_idx on sfx(category_slug);

-- 공개 읽기 전용: RLS 켜고 anon 역할에는 select만 허용
alter table categories enable row level security;
alter table sfx enable row level security;

create policy "public read categories" on categories
  for select using (true);

create policy "public read sfx" on sfx
  for select using (true);

-- 카테고리 초기 데이터
insert into categories (slug, label, description, sort_order) values
  ('eff', 'Effect', '동작·타격·상호작용에 쓰는 짧은 효과음', 1),
  ('foley', 'Foley', '발소리, 옷깃, 종이 등 사실적인 생활 동작음', 2),
  ('ambi', 'Ambience', '공간의 분위기를 채우는 배경음', 3)
on conflict (slug) do nothing;

-- 기존 목업 데이터 이관
insert into sfx (name, category_slug, image) values
  ('발자국 소리 - 나무 바닥', 'eff', '나무 바닥 위를 걷는 발 아이콘 이미지'),
  ('버튼 클릭음 - UI 클릭', 'eff', '손가락이 버튼을 누르는 아이콘 이미지'),
  ('검 휘두르는 소리', 'eff', '칼날이 허공을 가르는 궤적 이미지'),
  ('문 여닫는 소리 - 나무문', 'foley', '나무 문이 열려 있는 아이콘 이미지'),
  ('종이 넘기는 소리', 'foley', '책 페이지를 넘기는 손 아이콘 이미지'),
  ('옷깃 스치는 소리', 'foley', '옷 소매가 스치는 질감 이미지'),
  ('빗소리 - 도시 야간', 'ambi', '밤에 창밖으로 비 내리는 도시 풍경 이미지'),
  ('숲속 새소리 - 아침', 'ambi', '이른 아침 햇살이 비치는 숲 이미지'),
  ('카페 웅성거림 - 오후', 'ambi', '사람들로 붐비는 카페 내부 이미지');
