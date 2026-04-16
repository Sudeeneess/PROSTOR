import type { OrderStatusDto } from '../services/api';

/** Справочник имя статуса → id из GET /api/orders-statuses */
export function orderStatusIdsByName(statuses: OrderStatusDto[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of statuses) {
    map.set(s.name.toUpperCase(), s.id);
  }
  return map;
}

/** Подпись для покупателя в ЛК */
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

/** Подпись для выпадающего списка на складе (сборка) */
export function assemblyStatusOptionLabel(code: string): string {
  switch (code.toUpperCase()) {
    case 'PENDING':
      return 'PENDING — на рассмотрении';
    case 'CONFIRMED':
      return 'CONFIRMED — собирается на складе';
    case 'SHIPPED':
      return 'SHIPPED — отправлено на отгрузку';
    default:
      return code;
  }
}

/** Подпись для выпадающего списка на складе (отгрузка) */
export function shipmentStatusOptionLabel(code: string): string {
  switch (code.toUpperCase()) {
    case 'SHIPPED':
      return 'SHIPPED — отправлено на отгрузку';
    case 'IN_TRANSIT':
      return 'IN_TRANSIT — в пути';
    case 'DELIVERED':
      return 'DELIVERED — готов к выдаче';
    case 'ISSUED':
      return 'ISSUED — выдано покупателю';
    default:
      return code;
  }
}
