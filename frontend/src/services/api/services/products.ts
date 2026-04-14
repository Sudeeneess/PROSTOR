import type { RequestFn } from '../client';
import type { Product, ProductsResponse, ProductRequest } from '../types/product';
import type { ProductCardRequest, ProductCardResponse } from '../types/product';
import { getErrorStatus } from '../utils/httpError';

export function createProductsService(request: RequestFn) {
  return {
    async getProducts(filters?: {
      categoryId?: number;
      sellerId?: number;
      minPrice?: number;
      maxPrice?: number;
      name?: string;
      page?: number;
      size?: number;
    }): Promise<{
      success: boolean;
      data?: ProductsResponse;
      error?: string;
      status?: number;
    }> {
      try {
        const queryParams = new URLSearchParams();
        const merged = { page: 0, size: 20, ...filters };
        Object.entries(merged).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });

        const queryString = queryParams.toString();
        const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`;

        const response = await request<ProductsResponse>(endpoint);

        return {
          success: true,
          data: response,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка загрузки товаров',
          status: getErrorStatus(error),
        };
      }
    },

    async getProductById(
      id: number
    ): Promise<{ success: boolean; data?: Product; error?: string; status?: number }> {
      try {
        const response = await request<Product>(`/api/products/${id}`);
        return {
          success: true,
          data: response,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка загрузки товара',
          status: getErrorStatus(error),
        };
      }
    },

    async getSellerProducts(
      page: number = 0,
      size: number = 20
    ): Promise<{
      success: boolean;
      data?: ProductsResponse;
      error?: string;
      status?: number;
    }> {
      try {
        const data = await request<ProductsResponse>(
          `/api/seller/products?page=${page}&size=${size}`
        );
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка загрузки товаров продавца',
          status: getErrorStatus(error),
        };
      }
    },

    async getSellerProductById(
      id: number
    ): Promise<{ success: boolean; data?: Product; error?: string; status?: number }> {
      try {
        const data = await request<Product>(`/api/seller/products/${id}`);
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка загрузки товара',
          status: getErrorStatus(error),
        };
      }
    },

    async createSellerProduct(
      body: ProductRequest
    ): Promise<{ success: boolean; data?: Product; error?: string; status?: number }> {
      try {
        const data = await request<Product>('/api/seller/products', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка создания товара',
          status: getErrorStatus(error),
        };
      }
    },

    async updateSellerProduct(
      id: number,
      body: ProductRequest
    ): Promise<{ success: boolean; data?: Product; error?: string; status?: number }> {
      try {
        const data = await request<Product>(`/api/seller/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка обновления товара',
          status: getErrorStatus(error),
        };
      }
    },

    async deleteSellerProduct(
      id: number
    ): Promise<{ success: boolean; error?: string; status?: number }> {
      try {
        await request<Record<string, never>>(`/api/seller/products/${id}`, {
          method: 'DELETE',
        });
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка удаления товара',
          status: getErrorStatus(error),
        };
      }
    },

    async getProductCards(
      productId: number
    ): Promise<{
      success: boolean;
      data?: ProductCardResponse[];
      error?: string;
      status?: number;
    }> {
      try {
        const response = await request<ProductCardResponse[]>(
          `/api/products/${productId}/cards`
        );
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Ошибка загрузки карточек товара',
          status: getErrorStatus(error),
        };
      }
    },

    async getProductCardById(
      productId: number,
      cardId: number
    ): Promise<{
      success: boolean;
      data?: ProductCardResponse;
      error?: string;
      status?: number;
    }> {
      try {
        const response = await request<ProductCardResponse>(
          `/api/products/${productId}/cards/${cardId}`
        );
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка загрузки карточки товара',
          status: getErrorStatus(error),
        };
      }
    },

    /**
     * POST /api/products/{productId}/cards — в теле обязателен productId и он должен совпадать с productId в пути.
     */
    async createProductCard(
      productId: number,
      body: Omit<ProductCardRequest, 'productId'>
    ): Promise<{
      success: boolean;
      data?: ProductCardResponse;
      error?: string;
      status?: number;
    }> {
      try {
        const payload: ProductCardRequest = {
          ...body,
          productId,
        };
        const response = await request<ProductCardResponse>(
          `/api/products/${productId}/cards`,
          {
            method: 'POST',
            body: JSON.stringify(payload),
          }
        );
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка создания карточки товара',
          status: getErrorStatus(error),
        };
      }
    },

    async updateProductCard(
      productId: number,
      cardId: number,
      body: ProductCardRequest
    ): Promise<{
      success: boolean;
      data?: ProductCardResponse;
      error?: string;
      status?: number;
    }> {
      try {
        const response = await request<ProductCardResponse>(
          `/api/products/${productId}/cards/${cardId}`,
          {
            method: 'PUT',
            body: JSON.stringify(body),
          }
        );
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка обновления карточки товара',
          status: getErrorStatus(error),
        };
      }
    },

    async deleteProductCard(
      productId: number,
      cardId: number
    ): Promise<{ success: boolean; error?: string; status?: number }> {
      try {
        await request<Record<string, never>>(`/api/products/${productId}/cards/${cardId}`, {
          method: 'DELETE',
        });
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка удаления карточки товара',
          status: getErrorStatus(error),
        };
      }
    },
  };
}