/**
 * Поля в духе БД: products + product_card + brand + size.
 * Позже заменить ответом API GET /products/:id/detail
 */
export type ProductDetail = {
  id: number;
  name: string;
  price: number;
  description: string;
  brandName: string;
  sizeName: string;
  type: string;
  photos: string[];
};

function photosForProduct(id: number, count: number): string[] {
  return Array.from({ length: count }, (_, i) =>
    `https://picsum.photos/seed/prostor-${id}-${i}/800/1000`
  );
}

const baseDetails = (id: number): ProductDetail => ({
  id,
  name: `Название товара — позиция ${id}`,
  price: 1990 + id * 150,
  description:
    'Описание товара из поля product_card.description: материал, назначение, уход. Заглушка до подключения API.',
  brandName: ['PROSTOR', 'NORTH', 'URBAN', 'BASE'][id % 4],
  sizeName: ['S', 'M', 'L', 'XL', '42', '43'][id % 6],
  type: ['одежда', 'обувь', 'аксессуар'][id % 3],
  photos: photosForProduct(id, 5),
});

const cache = new Map<number, ProductDetail>();

export function getMockProductDetail(id: number): ProductDetail | undefined {
  if (id < 1 || id > 99999 || !Number.isFinite(id)) return undefined;
  if (!cache.has(id)) {
    cache.set(id, baseDetails(id));
  }
  return cache.get(id);
}
