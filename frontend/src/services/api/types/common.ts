/** Как Spring отдаёт страницу списка (товары, категории, бренды). */
export interface PageDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
