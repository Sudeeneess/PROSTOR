export interface OrderItem {
  productId: number;
  amount: number;
}

export interface CreateOrderRequest {
  customerId: number;
  statusId?: number;
  items: OrderItem[];
}

export interface OrderStatusDto {
  id: number;
  name: string;
}

/** POST/PUT /api/orders-statuses — обязательное поле name. */
export interface OrderStatusBody {
  name: string;
}

export interface OrderItemResponseDto {
  id: number;
  productId: number;
  productName?: string;
  amount: number;
  sellerCommission?: number;
  netPayout?: number;
  isOrdered?: boolean;
  isFinalized?: boolean;
  soldAt?: string;
}

export interface OrderResponseDto {
  id: number;
  customerId: number;
  status: OrderStatusDto;
  orderDate?: string;
  totalAmount: number;
  items: OrderItemResponseDto[];
}

export interface SellerOrdersDashboardResponse {
  newProducts: number;
  assembling: number;
  onTheWay: number;
  sold: number;
}
