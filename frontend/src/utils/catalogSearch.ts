import { CATALOG_CATEGORIES } from '../data/categories';
import { getUniqueBrandNames } from '../data/mockCatalogProducts';

export type HeaderSearchCategoryHit = {
  kind: 'category';
  slug: string;
  label: string;
};

export type HeaderSearchSubcategoryHit = {
  kind: 'subcategory';
  categorySlug: string;
  subSlug: string;
  label: string;
  categoryLabel: string;
};

export type HeaderSearchBrandHit = {
  kind: 'brand';
  brandName: string;
};

export type HeaderSearchHit =
  | HeaderSearchCategoryHit
  | HeaderSearchSubcategoryHit
  | HeaderSearchBrandHit;

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function matches(text: string, query: string): boolean {
  const t = norm(text);
  const q = norm(query);
  if (!q) return false;
  if (t.includes(q)) return true;
  const tCompact = t.replace(/\s/g, '');
  const qCompact = q.replace(/\s/g, '');
  return qCompact.length > 0 && tCompact.includes(qCompact);
}

const MAX_EACH = 8;

/**
 * Подсказки для строки поиска в шапке: категории, подкатегории (по имени/slug),
 * бренды из мок-данных каталога.
 */
export function searchHeaderCatalog(query: string): {
  categories: HeaderSearchCategoryHit[];
  subcategories: HeaderSearchSubcategoryHit[];
  brands: HeaderSearchBrandHit[];
} {
  const q = norm(query);
  if (!q) {
    return { categories: [], subcategories: [], brands: [] };
  }

  const categories: HeaderSearchCategoryHit[] = [];
  for (const cat of CATALOG_CATEGORIES) {
    if (categories.length >= MAX_EACH) break;
    if (
      matches(cat.name, query) ||
      matches(cat.slug, query) ||
      matches(cat.slug.replace(/-/g, ' '), query)
    ) {
      categories.push({
        kind: 'category',
        slug: cat.slug,
        label: cat.name,
      });
    }
  }

  const subcategories: HeaderSearchSubcategoryHit[] = [];
  outer: for (const cat of CATALOG_CATEGORIES) {
    for (const sub of cat.subcategories) {
      if (subcategories.length >= MAX_EACH) break outer;
      if (
        matches(sub.name, query) ||
        matches(sub.slug, query) ||
        matches(sub.slug.replace(/-/g, ' '), query) ||
        matches(`${cat.name} ${sub.name}`, query)
      ) {
        subcategories.push({
          kind: 'subcategory',
          categorySlug: cat.slug,
          subSlug: sub.slug,
          label: sub.name,
          categoryLabel: cat.name,
        });
      }
    }
  }

  const brands: HeaderSearchBrandHit[] = [];
  for (const brandName of getUniqueBrandNames()) {
    if (brands.length >= MAX_EACH) break;
    if (matches(brandName, query)) {
      brands.push({ kind: 'brand', brandName });
    }
  }

  return { categories, subcategories, brands };
}

export function getHeaderSearchNavigatePath(hit: HeaderSearchHit): string {
  switch (hit.kind) {
    case 'category':
      return `/catalog/${hit.slug}`;
    case 'subcategory':
      return `/catalog/${hit.categorySlug}/${hit.subSlug}`;
    case 'brand':
      return `/catalog?brand=${encodeURIComponent(hit.brandName)}`;
  }
}

/** Первый подходящий результат (для Enter в поле поиска). */
export function getFirstHeaderSearchHit(query: string): HeaderSearchHit | null {
  const { categories, subcategories, brands } = searchHeaderCatalog(query);
  return categories[0] ?? subcategories[0] ?? brands[0] ?? null;
}
