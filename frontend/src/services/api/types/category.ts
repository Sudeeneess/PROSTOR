export interface Category {
  id: number;
  categoryName: string;
}

/** Тело POST/PUT /api/categories. */
export interface CategoryRequest {
  categoryName: string;
}

/** Единый размер первой страницы категорий для витрины и меню. */
export const CATEGORIES_LIST_PAGE_SIZE = 100;
