/** Ответ GET /api/customer/dashboard */
export interface CustomerDashboard {
  role: string;
  username: string;
  customerId?: number | null;
  message?: string;
  status?: string;
  redirect?: string;
}
