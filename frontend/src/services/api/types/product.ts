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


export interface ProductRequest {
  name: string;
  price: number;
  sellerId: number;
  categoryId: number;
  parentId?: number | null;
}

export interface SellerProduct {
  id: number;
  name: string;
  price: number;
  sellerId: number;
  categoryId: number;
  parentId?: number | null;
  createdAt?: string;
  availableQuantity: number;
}

export interface SellerProductCreateRequest {
  name: string;
  price: number;
  categoryId: number;
  parentId?: number | null;
  warehouseId: number;
  initialQuantity: number;
}

export type SellerProductsResponse = PageDto<SellerProduct>;

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

/* POST/PUT /api/products/{productId}/cards */
export interface ProductCardRequest {
  productId: number;
  brandId?: number | null;
  sizeId?: number | null;
  description: string;
  type: string;
  photo?: Array<Record<string, unknown>> | null;
  isActive?: boolean;
}

export interface WarehouseStockResponse {
  id: number;
  warehouseId: number;
  productId: number;
  productName?: string;
  quantity: number;
  reservedQuantity?: number;
  soldQuantity?: number;
  updatedAt?: string;
}

export interface WarehouseStockRequest {
  warehouseId: number;
  productId: number;
  quantity: number;
}
