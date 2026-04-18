import type { RequestFn } from '../client';
import type { PageDto } from '../types/common';
import type { BrandRow, BrandRequest } from '../types/brand';
import { getErrorStatus } from '../utils/httpError';

export function createBrandsService(request: RequestFn) {
  return {
    async getBrands(
      page: number = 0,
      size: number = 100
    ): Promise<{
      success: boolean;
      data?: PageDto<BrandRow>;
      error?: string;
      status?: number;
    }> {
      try {
        const response = await request<PageDto<BrandRow>>(
          `/api/brands?page=${page}&size=${size}`
        );
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка загрузки брендов',
          status: getErrorStatus(error),
        };
      }
    },

    async getBrandById(
      id: number
    ): Promise<{ success: boolean; data?: BrandRow; error?: string; status?: number }> {
      try {
        const response = await request<BrandRow>(`/api/brands/${id}`);
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка загрузки бренда',
          status: getErrorStatus(error),
        };
      }
    },

    async createBrand(
      body: BrandRequest
    ): Promise<{ success: boolean; data?: BrandRow; error?: string; status?: number }> {
      try {
        const response = await request<BrandRow>('/api/brands', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка создания бренда',
          status: getErrorStatus(error),
        };
      }
    },

    async updateBrand(
      id: number,
      body: BrandRequest
    ): Promise<{ success: boolean; data?: BrandRow; error?: string; status?: number }> {
      try {
        const response = await request<BrandRow>(`/api/brands/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка обновления бренда',
          status: getErrorStatus(error),
        };
      }
    },

    async deleteBrand(
      id: number
    ): Promise<{ success: boolean; error?: string; status?: number }> {
      try {
        await request<Record<string, never>>(`/api/brands/${id}`, {
          method: 'DELETE',
        });
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка удаления бренда',
          status: getErrorStatus(error),
        };
      }
    },
  };
}
