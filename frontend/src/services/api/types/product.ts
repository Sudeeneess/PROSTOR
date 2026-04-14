import type { PageDto } from './common';

export interface Product {
  id: number;
  name: string;
  price: number;
  sellerId: number;
  categoryId: number;
  parentId?: number | null;
  createdAt?: string;
}

export type ProductsResponse = PageDto<Product>;

/**
 * Тело POST/PUT товара (как ProductRequest в Java).
 * Для POST из кабинета продавца: `sellerId` в JSON всё равно обязателен для валидации,
 * бэкенд потом подставит id текущего продавца — можно временно передать любое положительное число, напр. `1`.
 */
export interface ProductRequest {
  name: string;
  price: number;
  sellerId: number;
  categoryId: number;
  parentId?: number | null;
}

export interface BrandDto {
  id: number;
  name: string;
}

export interface SizeDto {
  id: number;
  name: string;
}

export interface ProductCardResponse {
  id: number;
  productId: number;
  brand?: BrandDto | null;
  size?: SizeDto | null;
  description?: string | null;
  type?: string | null;
  photo?: Array<Record<string, unknown>> | null;
  isActive?: boolean | null;
}

/** Тело POST/PUT /api/products/{productId}/cards — поля как в ProductCardRequest на бэкенде. */
export interface ProductCardRequest {
  productId: number;
  brandId?: number | null;
  sizeId?: number | null;
  description: string;
  type: string;
  photo?: Array<Record<string, unknown>> | null;
  isActive?: boolean;
}
