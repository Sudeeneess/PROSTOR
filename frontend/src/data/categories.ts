/** Категории каталога — slug в URL только на английском (например /catalog/shoes/sneakers). */

export type SubcategoryDef = {
  slug: string;
  name: string;
};

export type CategoryDef = {
  slug: string;
  name: string;
  subcategories: SubcategoryDef[];
};

export const CATALOG_CATEGORIES: CategoryDef[] = [
  {
    slug: 'tops',
    name: 'Верх',
    subcategories: [
      { slug: 't-shirts', name: 'Футболки' },
      { slug: 'shirts', name: 'Рубашки' },
      { slug: 'sweaters', name: 'Свитера' },
    ],
  },
  {
    slug: 'bottoms',
    name: 'Низ',
    subcategories: [
      { slug: 'jeans', name: 'Джинсы' },
      { slug: 'pants', name: 'Брюки' },
      { slug: 'shorts', name: 'Шорты' },
      { slug: 'skirts', name: 'Юбки' },
    ],
  },
  {
    slug: 'outerwear',
    name: 'Верхняя одежда',
    subcategories: [
      { slug: 'jackets', name: 'Куртки' },
      { slug: 'coats', name: 'Пальто' },
      { slug: 'down-jackets', name: 'Пуховики' },
      { slug: 'raincoats', name: 'Плащи' },
    ],
  },
  {
    slug: 'shoes',
    name: 'Обувь',
    subcategories: [
      { slug: 'sneakers', name: 'Кроссовки' },
      { slug: 'boots', name: 'Ботинки' },
      { slug: 'dress-shoes', name: 'Туфли' },
      { slug: 'sandals', name: 'Сандалии' },
      { slug: 'high-boots', name: 'Сапоги' },
      { slug: 'canvas-sneakers', name: 'Кеды' },
    ],
  },
  {
    slug: 'other',
    name: 'Остальное',
    subcategories: [
      { slug: 'accessories', name: 'Аксессуары' },
      { slug: 'bags', name: 'Сумки' },
      { slug: 'hats', name: 'Головные уборы' },
      { slug: 'scarves', name: 'Шарфы' },
    ],
  },
];

export function findCategoryBySlug(slug: string): CategoryDef | undefined {
  return CATALOG_CATEGORIES.find((c) => c.slug === slug);
}

export function findSubcategoryBySlug(
  categorySlug: string,
  subSlug: string
): SubcategoryDef | undefined {
  const cat = findCategoryBySlug(categorySlug);
  return cat?.subcategories.find((s) => s.slug === subSlug);
}
