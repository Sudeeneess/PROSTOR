/** Ответ GET /api/customer/dashboard (тело Map из бэкенда). */
export interface CustomerDashboard {
  role: string;
  username: string;
  customerId?: number | null;
  message?: string;
  status?: string;
  redirect?: string;
}
