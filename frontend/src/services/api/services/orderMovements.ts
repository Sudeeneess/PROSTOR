import type { RequestFn } from '../client';
import type { OrderMovementDto } from '../types/orderMovement';
import { getErrorStatus } from '../utils/httpError';

export function createOrderMovementsService(request: RequestFn) {
  return {
    async getOrderMovementsForOrderItem(
      orderItemId: number
    ): Promise<{
      success: boolean;
      data?: OrderMovementDto[];
      error?: string;
      status?: number;
    }> {
      try {
        const data = await request<OrderMovementDto[]>(
          `/api/order-movements/order-item/${orderItemId}`
        );
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка загрузки движений',
          status: getErrorStatus(error),
        };
      }
    },

    async getOrderMovementById(
      id: number
    ): Promise<{ success: boolean; data?: OrderMovementDto; error?: string; status?: number }> {
      try {
        const data = await request<OrderMovementDto>(`/api/order-movements/${id}`);
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка загрузки движения',
          status: getErrorStatus(error),
        };
      }
    },

    /**
     * Новое движение: на бэкенде параметры в query (orderItemId, warehouseId, statusName).
     */
    async createOrderMovement(
      orderItemId: number,
      warehouseId: number,
      statusName: string
    ): Promise<{ success: boolean; data?: OrderMovementDto; error?: string; status?: number }> {
      try {
        const q = new URLSearchParams({
          orderItemId: String(orderItemId),
          warehouseId: String(warehouseId),
          statusName,
        });
        const data = await request<OrderMovementDto>(`/api/order-movements?${q}`, {
          method: 'POST',
        });
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка создания движения',
          status: getErrorStatus(error),
        };
      }
    },

    async updateOrderMovementStatus(
      movementId: number,
      statusName: string
    ): Promise<{ success: boolean; data?: OrderMovementDto; error?: string; status?: number }> {
      try {
        const encoded = encodeURIComponent(statusName);
        const data = await request<OrderMovementDto>(
          `/api/order-movements/${movementId}/status/${encoded}`,
          { method: 'PUT' }
        );
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка обновления движения',
          status: getErrorStatus(error),
        };
      }
    },
  };
}
