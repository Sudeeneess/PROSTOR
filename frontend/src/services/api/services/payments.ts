import type { RequestFn } from '../client';
import type { PaymentDto } from '../types/payment';
import { getErrorStatus } from '../utils/httpError';

export function createPaymentsService(request: RequestFn) {
  return {
    async getPaymentsForOrderItem(
      orderItemId: number
    ): Promise<{
      success: boolean;
      data?: PaymentDto[];
      error?: string;
      status?: number;
    }> {
      try {
        const data = await request<PaymentDto[]>(
          `/api/payments/order-item/${orderItemId}`
        );
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка загрузки платежей',
          status: getErrorStatus(error),
        };
      }
    },

    async getPaymentById(
      paymentId: number
    ): Promise<{ success: boolean; data?: PaymentDto; error?: string; status?: number }> {
      try {
        const data = await request<PaymentDto>(`/api/payments/${paymentId}`);
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка загрузки платежа',
          status: getErrorStatus(error),
        };
      }
    },

    async createPaymentForOrderItem(
      orderItemId: number
    ): Promise<{ success: boolean; data?: PaymentDto; error?: string; status?: number }> {
      try {
        const data = await request<PaymentDto>(`/api/payments/order-item/${orderItemId}`, {
          method: 'POST',
        });
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка создания платежа',
          status: getErrorStatus(error),
        };
      }
    },

    async confirmPayment(
      paymentId: number
    ): Promise<{ success: boolean; data?: PaymentDto; error?: string; status?: number }> {
      try {
        const data = await request<PaymentDto>(`/api/payments/${paymentId}/confirm`, {
          method: 'PUT',
        });
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка подтверждения платежа',
          status: getErrorStatus(error),
        };
      }
    },
  };
}
