import type { RequestFn } from '../client';
import type { PageDto } from '../types/common';
import type {
  CreateOrderRequest,
  OrderResponseDto,
  OrderStatusBody,
  OrderStatusDto,
  SellerOrdersDashboardResponse,
} from '../types/order';
import { getErrorStatus } from '../utils/httpError';

export function createOrdersService(request: RequestFn) {
  return {
    async getSellerOrdersDashboard(): Promise<{
      success: boolean;
      data?: SellerOrdersDashboardResponse;
      error?: string;
      status?: number;
    }> {
      try {
        const data = await request<SellerOrdersDashboardResponse>(
          '/api/seller/orders/dashboard'
        );
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка загрузки статистики продавца',
          status: getErrorStatus(error),
        };
      }
    },

    async getOrders(
      page: number = 0,
      size: number = 20
    ): Promise<{
      success: boolean;
      data?: PageDto<OrderResponseDto>;
      error?: string;
      status?: number;
    }> {
      try {
        const data = await request<PageDto<OrderResponseDto>>(
          `/api/orders?page=${page}&size=${size}`
        );
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка загрузки заказов',
          status: getErrorStatus(error),
        };
      }
    },

    async getOrderById(
      id: number
    ): Promise<{ success: boolean; data?: OrderResponseDto; error?: string; status?: number }> {
      try {
        const data = await request<OrderResponseDto>(`/api/orders/${id}`);
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка загрузки заказа',
          status: getErrorStatus(error),
        };
      }
    },

    async getOrdersForCustomer(
      customerId: number
    ): Promise<{
      success: boolean;
      data?: OrderResponseDto[];
      error?: string;
      status?: number;
    }> {
      try {
        const data = await request<OrderResponseDto[]>(
          `/api/orders/customer/${customerId}`
        );
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка загрузки заказов покупателя',
          status: getErrorStatus(error),
        };
      }
    },

    async getOrdersByStatus(
      statusId: number,
      page: number = 0,
      size: number = 20
    ): Promise<{
      success: boolean;
      data?: PageDto<OrderResponseDto>;
      error?: string;
      status?: number;
    }> {
      try {
        const data = await request<PageDto<OrderResponseDto>>(
          `/api/orders/status/${statusId}?page=${page}&size=${size}`
        );
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка загрузки заказов по статусу',
          status: getErrorStatus(error),
        };
      }
    },

    async createOrder(
      orderData: CreateOrderRequest
    ): Promise<{ success: boolean; data?: OrderResponseDto; error?: string; status?: number }> {
      try {
        const response = await request<OrderResponseDto>('/api/orders', {
          method: 'POST',
          body: JSON.stringify(orderData),
        });
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка создания заказа',
          status: getErrorStatus(error),
        };
      }
    },

    async confirmOrder(
      orderId: number
    ): Promise<{ success: boolean; data?: OrderResponseDto; error?: string; status?: number }> {
      try {
        const data = await request<OrderResponseDto>(`/api/orders/${orderId}/confirm`, {
          method: 'PUT',
        });
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка подтверждения заказа',
          status: getErrorStatus(error),
        };
      }
    },

    async cancelOrder(
      orderId: number
    ): Promise<{ success: boolean; data?: OrderResponseDto; error?: string; status?: number }> {
      try {
        const data = await request<OrderResponseDto>(`/api/orders/${orderId}/cancel`, {
          method: 'PUT',
        });
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка отмены заказа',
          status: getErrorStatus(error),
        };
      }
    },

    async setOrderStatus(
      orderId: number,
      statusId: number
    ): Promise<{ success: boolean; data?: OrderResponseDto; error?: string; status?: number }> {
      try {
        const data = await request<OrderResponseDto>(
          `/api/orders/${orderId}/status/${statusId}`,
          { method: 'PUT' }
        );
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка смены статуса заказа',
          status: getErrorStatus(error),
        };
      }
    },

    async deleteOrder(
      orderId: number
    ): Promise<{ success: boolean; error?: string; status?: number }> {
      try {
        await request<Record<string, never>>(`/api/orders/${orderId}`, {
          method: 'DELETE',
        });
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка удаления заказа',
          status: getErrorStatus(error),
        };
      }
    },

    async getOrderStatuses(
      page: number = 0,
      size: number = 20
    ): Promise<{
      success: boolean;
      data?: PageDto<OrderStatusDto>;
      error?: string;
      status?: number;
    }> {
      try {
        const data = await request<PageDto<OrderStatusDto>>(
          `/api/orders-statuses?page=${page}&size=${size}`
        );
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка загрузки статусов заказов',
          status: getErrorStatus(error),
        };
      }
    },

    async getOrderStatusById(
      id: number
    ): Promise<{ success: boolean; data?: OrderStatusDto; error?: string; status?: number }> {
      try {
        const data = await request<OrderStatusDto>(`/api/orders-statuses/${id}`);
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка загрузки статуса',
          status: getErrorStatus(error),
        };
      }
    },

    async createOrderStatus(
      body: OrderStatusBody
    ): Promise<{ success: boolean; data?: OrderStatusDto; error?: string; status?: number }> {
      try {
        const data = await request<OrderStatusDto>('/api/orders-statuses', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка создания статуса',
          status: getErrorStatus(error),
        };
      }
    },

    async updateOrderStatus(
      id: number,
      body: OrderStatusBody
    ): Promise<{ success: boolean; data?: OrderStatusDto; error?: string; status?: number }> {
      try {
        const data = await request<OrderStatusDto>(`/api/orders-statuses/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка обновления статуса',
          status: getErrorStatus(error),
        };
      }
    },

    async deleteOrderStatus(
      id: number
    ): Promise<{ success: boolean; error?: string; status?: number }> {
      try {
        await request<Record<string, never>>(`/api/orders-statuses/${id}`, {
          method: 'DELETE',
        });
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка удаления статуса',
          status: getErrorStatus(error),
        };
      }
    },
  };
}
