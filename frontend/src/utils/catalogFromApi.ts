import type { CatalogGridProduct } from '../data/mockCatalogProducts';
import type { Product, ProductCardResponse } from '../services/api';
import { api } from '../services/api';
import { API_BASE_URL } from '../services/api/client';

const PLACEHOLDER_IMAGE =
  'https://placehold.co/400x520/e8eef8/447add?text=PROSTOR';

export function firstPhotoUrlFromCard(
  photo: ProductCardResponse['photo']
): string | null {
  if (!photo || !Array.isArray(photo) || photo.length === 0) return null;
  const first = photo[0] as Record<string, unknown>;
  const url = first.url ?? first.src ?? first['imageUrl'];
  if (typeof url !== 'string' || url.length === 0) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`;
  }
  return `${API_BASE_URL}/${url}`;
}

export function apiProductToGrid(
  product: Product,
  card: ProductCardResponse | null | undefined,
  opts?: { categoryKey?: string; subKey?: string }
): CatalogGridProduct {
  const categorySlug = opts?.categoryKey ?? 'catalog';
  const subcategorySlug = opts?.subKey ?? 'all';
  return {
    id: product.id,
    name: product.name,
    priceRub: Math.round(Number(product.price)),
    rating: '4.8',
    reviews: '—',
    categorySlug,
    subcategorySlug,
    brandName: card?.brand?.name ?? '—',
    sizeName: card?.size?.name ?? '—',
    type: card?.type ?? '—',
    imageUrl: firstPhotoUrlFromCard(card?.photo) ?? PLACEHOLDER_IMAGE,
  };
}

export function pickDisplayCard(
  cards: ProductCardResponse[] | undefined
): ProductCardResponse | undefined {
  if (!cards?.length) return undefined;
  const active = cards.find((c) => c.isActive !== false);
  return active ?? cards[0];
}

export async function enrichProductListForGrid(
  products: Product[],
  opts?: { categoryKey?: string; subKey?: string }
): Promise<CatalogGridProduct[]> {
  return Promise.all(
    products.map(async (p) => {
      const cardsRes = await api.getProductCards(p.id);
      const list = cardsRes.success ? cardsRes.data ?? [] : [];
      const card = pickDisplayCard(list);
      return apiProductToGrid(p, card, opts);
    })
  );
}
