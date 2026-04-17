/** Номер заказа в интерфейсе менеджера склада — id из таблицы orders. */
export function warehouseOrderNumber(orderId: number): string {
  return String(orderId);
}
