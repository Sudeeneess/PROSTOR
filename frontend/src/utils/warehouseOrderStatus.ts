import type { OrderStatusDto } from '../services/api';

/*id из GET /api/orders-statuses */
export function orderStatusIdsByName(statuses: OrderStatusDto[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of statuses) {
    map.set(s.name.toUpperCase(), s.id);
  }
  return map;
}

/*подписи для покупателя в ЛК */
export function buyerOrderStatusLabelRu(statusName: string | undefined): string {
  const n = (statusName ?? '').toUpperCase();
  switch (n) {
    case 'PENDING':
      return 'Ожидается сборка';
    case 'CONFIRMED':
      return 'Собирается на складе';
    case 'SHIPPED':
      return 'Отгружен';
    case 'IN_TRANSIT':
      return 'В пути';
    case 'DELIVERED':
      return 'Готов к выдаче';
    case 'ISSUED':
      return 'Выдано';
    case 'CANCELLED':
      return 'Отменён';
    default:
      return statusName?.trim() ? statusName : 'Статус уточняется';
  }
}

export function assemblyStatusOptionLabel(code: string): string {
  switch (code.toUpperCase()) {
    case 'PENDING':
      return 'На рассмотрении';
    case 'CONFIRMED':
      return 'Собирается на складе';
    case 'SHIPPED':
      return 'Отправлено на отгрузку';
    default:
      return code.trim() ? code : 'Статус уточняется';
  }
}

export function shipmentStatusOptionLabel(code: string): string {
  switch (code.toUpperCase()) {
    case 'SHIPPED':
      return 'Отправлено на отгрузку';
    case 'IN_TRANSIT':
      return 'В пути';
    case 'DELIVERED':
      return 'Готов к выдаче';
    case 'ISSUED':
      return 'Выдано покупателю';
    default:
      return code.trim() ? code : 'Статус уточняется';
  }
}
