export const CATEGORIES = [
  {
    slug: 'eff',
    label: 'Effect',
    description: '동작·타격·상호작용에 쓰는 짧은 효과음',
  },
  {
    slug: 'foley',
    label: 'Foley',
    description: '발소리, 옷깃, 종이 등 사실적인 생활 동작음',
  },
  {
    slug: 'ambi',
    label: 'Ambience',
    description: '공간의 분위기를 채우는 배경음',
  },
];

export function getCategory(slug) {
  return CATEGORIES.find((c) => c.slug === slug);
}
