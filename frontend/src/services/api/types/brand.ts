export interface BrandRow {
  id: number;
  name: string;
}

/** Тело POST/PUT /api/brands. */
export interface BrandRequest {
  name: string;
}
