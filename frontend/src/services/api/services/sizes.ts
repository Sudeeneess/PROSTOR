import type { RequestFn } from '../client';
import type { PageDto } from '../types/common';
import type { SizeDto } from '../types/product';
import type { SizeRequest } from '../types/size';
import { getErrorStatus } from '../utils/httpError';

export function createSizesService(request: RequestFn) {
  return {
    async getSizes(
      page: number = 0,
      size: number = 100
    ): Promise<{
      success: boolean;
      data?: PageDto<SizeDto>;
      error?: string;
      status?: number;
    }> {
      try {
        const data = await request<PageDto<SizeDto>>(
          `/api/sizes?page=${page}&size=${size}`
        );
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка загрузки размеров',
          status: getErrorStatus(error),
        };
      }
    },

    async getSizeById(
      id: number
    ): Promise<{ success: boolean; data?: SizeDto; error?: string; status?: number }> {
      try {
        const data = await request<SizeDto>(`/api/sizes/${id}`);
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка загрузки размера',
          status: getErrorStatus(error),
        };
      }
    },

    async createSize(
      body: SizeRequest
    ): Promise<{ success: boolean; data?: SizeDto; error?: string; status?: number }> {
      try {
        const data = await request<SizeDto>('/api/sizes', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка создания размера',
          status: getErrorStatus(error),
        };
      }
    },

    async updateSize(
      id: number,
      body: SizeRequest
    ): Promise<{ success: boolean; data?: SizeDto; error?: string; status?: number }> {
      try {
        const data = await request<SizeDto>(`/api/sizes/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка обновления размера',
          status: getErrorStatus(error),
        };
      }
    },

    async deleteSize(
      id: number
    ): Promise<{ success: boolean; error?: string; status?: number }> {
      try {
        await request<Record<string, never>>(`/api/sizes/${id}`, {
          method: 'DELETE',
        });
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка удаления размера',
          status: getErrorStatus(error),
        };
      }
    },
  };
}
