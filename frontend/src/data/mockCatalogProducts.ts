import { CATALOG_CATEGORIES } from './categories';


export type CatalogGridProduct = {
  id: number;
  name: string;
  priceRub: number;
  rating: string;
  reviews: string;
  categorySlug: string;
  subcategorySlug: string;
  brandName: string;
  sizeName: string;
  type: string;
  imageUrl: string;
};

export type CatalogFilterState = {
  brands: string[];
  sizes: string[];
  subcategorySlugs: string[];
  priceMin: string;
  priceMax: string;
};

export function emptyCatalogFilter(): CatalogFilterState {
  return {
    brands: [],
    sizes: [],
    subcategorySlugs: [],
    priceMin: '',
    priceMax: '',
  };
}

const byId = new Map<number, CatalogGridProduct>();

const BRANDS = ['PROSTOR', 'NORTH', 'URBAN', 'BASE', 'LINE'] as const;
const SIZES = ['S', 'M', 'L', 'XL', '42', '43', '44'] as const;
const TYPES = ['одежда', 'обувь', 'аксессуар', 'спорт'] as const;

function formatRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

function buildAllProducts(): CatalogGridProduct[] {
  const list: CatalogGridProduct[] = [];
  let id = 1;

  for (const cat of CATALOG_CATEGORIES) {
    for (const sub of cat.subcategories) {
      const perSub = 4;
      for (let i = 1; i <= perSub; i++) {
        const priceRub = 890 + id * 137;
        const p: CatalogGridProduct = {
          id,
          name: `${sub.name} — модель ${i}`,
          priceRub,
          rating: (4.5 + (id % 5) * 0.1).toFixed(1),
          reviews: String(12 + id * 97),
          categorySlug: cat.slug,
          subcategorySlug: sub.slug,
          brandName: BRANDS[id % BRANDS.length],
          sizeName: SIZES[id % SIZES.length],
          type: TYPES[id % TYPES.length],
          imageUrl: `https://picsum.photos/seed/prostor-card-${id}/400/520`,
        };
        list.push(p);
        byId.set(id, p);
        id += 1;
      }
    }
  }

  return list;
}

const ALL_PRODUCTS = buildAllProducts();

export function getAllCatalogProducts(): CatalogGridProduct[] {
  return ALL_PRODUCTS;
}

export function getCatalogProductById(id: number): CatalogGridProduct | undefined {
  return byId.get(id);
}

export function getProductsForCategory(
  categorySlug: string,
  subcategorySlug?: string
): CatalogGridProduct[] {
  return ALL_PRODUCTS.filter((p) => {
    if (p.categorySlug !== categorySlug) return false;
    if (subcategorySlug && p.subcategorySlug !== subcategorySlug) return false;
    return true;
  });
}

export function getHomeGridProducts(): CatalogGridProduct[] {
  return ALL_PRODUCTS.slice(0, 16);
}

export function getUniqueBrandNames(): string[] {
  return [...new Set(ALL_PRODUCTS.map((p) => p.brandName))].sort();
}

export function getFilterOptions(products: CatalogGridProduct[]) {
  const brands = [...new Set(products.map((p) => p.brandName))].sort();
  const sizes = [...new Set(products.map((p) => p.sizeName))].sort();
  const prices = products.map((p) => p.priceRub);
  return {
    brands,
    sizes,
    priceMinBound: prices.length ? Math.min(...prices) : 0,
    priceMaxBound: prices.length ? Math.max(...prices) : 0,
  };
}

export function filterCatalogProducts(
  items: CatalogGridProduct[],
  f: CatalogFilterState
): CatalogGridProduct[] {
  const minRaw = f.priceMin.trim();
  const maxRaw = f.priceMax.trim();
  const minParsed = minRaw === '' ? null : Number(minRaw);
  const maxParsed = maxRaw === '' ? null : Number(maxRaw);

  return items.filter((p) => {
    if (f.brands.length > 0 && !f.brands.includes(p.brandName)) return false;
    if (f.sizes.length > 0 && !f.sizes.includes(p.sizeName)) return false;
    if (
      f.subcategorySlugs.length > 0 &&
      !f.subcategorySlugs.includes(p.subcategorySlug)
    ) {
      return false;
    }
    if (
      minParsed !== null &&
      Number.isFinite(minParsed) &&
      p.priceRub < minParsed
    ) {
      return false;
    }
    if (
      maxParsed !== null &&
      Number.isFinite(maxParsed) &&
      p.priceRub > maxParsed
    ) {
      return false;
    }
    return true;
  });
}

export function toProductCardProps(p: CatalogGridProduct) {
  return {
    id: p.id,
    name: p.name,
    price: formatRub(p.priceRub),
    rating: p.rating,
    reviews: p.reviews,
    imageUrl: p.imageUrl,
  };
}
