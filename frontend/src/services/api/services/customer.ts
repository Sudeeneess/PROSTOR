import type { RequestFn } from '../client';
import type { CustomerDashboard } from '../types/customer';
import { getErrorStatus } from '../utils/httpError';

export function createCustomerService(request: RequestFn) {
  return {
    async getCustomerDashboard(): Promise<{
      success: boolean;
      data?: CustomerDashboard;
      error?: string;
      status?: number;
    }> {
      try {
        const response = await request<CustomerDashboard>('/api/customer/dashboard');
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка загрузки данных покупателя',
          status: getErrorStatus(error),
        };
      }
    },
  };
}
