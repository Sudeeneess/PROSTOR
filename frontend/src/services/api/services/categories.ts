import type { RequestFn } from '../client';
import type { PageDto } from '../types/common';
import type { Category, CategoryRequest } from '../types/category';
import { CATEGORIES_LIST_PAGE_SIZE } from '../types/category';
import { getErrorStatus } from '../utils/httpError';

const CATEGORIES_LIST_CACHE_MS = 60_000;

type CategoriesListResult = {
  success: boolean;
  data?: PageDto<Category>;
  error?: string;
  status?: number;
};

let categoriesListInflight: Promise<CategoriesListResult> | null = null;
let categoriesListCache: CategoriesListResult | null = null;
let categoriesListCacheAt = 0;

function invalidateCategoriesListCache(): void {
  categoriesListCache = null;
  categoriesListCacheAt = 0;
}

export function createCategoriesService(request: RequestFn) {
  const service = {
   /*{@link CATEGORIES_LIST_PAGE_SIZE}*/
    async getCategoriesListForUi(): Promise<CategoriesListResult> {
      const now = Date.now();
      const hit = categoriesListCache;
      if (
        hit?.success &&
        hit.data &&
        now - categoriesListCacheAt < CATEGORIES_LIST_CACHE_MS
      ) {
        return hit;
      }
      if (categoriesListInflight) {
        return categoriesListInflight;
      }

      categoriesListInflight = (async (): Promise<CategoriesListResult> => {
        try {
          const response = await request<PageDto<Category>>(
            `/api/categories?page=0&size=${CATEGORIES_LIST_PAGE_SIZE}`
          );
          const res: CategoriesListResult = { success: true, data: response };
          categoriesListCache = res;
          categoriesListCacheAt = Date.now();
          return res;
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error ? error.message : 'Ошибка загрузки категорий',
            status: getErrorStatus(error),
          };
        }
      })().finally(() => {
        categoriesListInflight = null;
      });

      return categoriesListInflight;
    },

    /**
     * Произвольная пагинация категорий (например, админка). Для витрины не вызывайте напрямую —
     * используйте {@link getCategoriesListForUi}. При `page === 0` и `size === CATEGORIES_LIST_PAGE_SIZE`
     * запрос уходит в тот же кэш, что и витрина (без лишнего HTTP).
     */
    async getCategories(
      page: number = 0,
      size: number = CATEGORIES_LIST_PAGE_SIZE
    ): Promise<CategoriesListResult> {
      if (page === 0 && size === CATEGORIES_LIST_PAGE_SIZE) {
        return service.getCategoriesListForUi();
      }
      try {
        const response = await request<PageDto<Category>>(
          `/api/categories?page=${page}&size=${size}`
        );
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка загрузки категорий',
          status: getErrorStatus(error),
        };
      }
    },

    async getCategoryById(
      id: number
    ): Promise<{ success: boolean; data?: Category; error?: string; status?: number }> {
      try {
        const response = await request<Category>(`/api/categories/${id}`);
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка загрузки категории',
          status: getErrorStatus(error),
        };
      }
    },

    async createCategory(
      body: CategoryRequest
    ): Promise<{ success: boolean; data?: Category; error?: string; status?: number }> {
      try {
        const response = await request<Category>('/api/categories', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        invalidateCategoriesListCache();
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка создания категории',
          status: getErrorStatus(error),
        };
      }
    },

    async updateCategory(
      id: number,
      body: CategoryRequest
    ): Promise<{ success: boolean; data?: Category; error?: string; status?: number }> {
      try {
        const response = await request<Category>(`/api/categories/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        invalidateCategoriesListCache();
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка обновления категории',
          status: getErrorStatus(error),
        };
      }
    },

    async deleteCategory(
      id: number
    ): Promise<{ success: boolean; error?: string; status?: number }> {
      try {
        await request<Record<string, never>>(`/api/categories/${id}`, {
          method: 'DELETE',
        });
        invalidateCategoriesListCache();
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка удаления категории',
          status: getErrorStatus(error),
        };
      }
    },
  };

  return service;
}
