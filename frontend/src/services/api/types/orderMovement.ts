/** Элемент движения по складу (GET /api/order-movements). */
export interface OrderMovementDto {
  id: number;
  warehouseId: number;
  orderItemId: number;
  status: string;
  createdAt?: string;
}
