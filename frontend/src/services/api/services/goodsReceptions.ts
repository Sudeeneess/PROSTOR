import type { RequestFn } from '../client';
import type {
  GoodsReceptionDetailsDto,
  GoodsReceptionListDto,
  ListGoodsReceptionsParams,
} from '../types/goodsReception';

/** Без дат бэкенд передаёт null в JPQL → PostgreSQL может вернуть 400 (тип параметра). */
const DEFAULT_RECEPTION_LIST_FROM = '2000-01-01';
const DEFAULT_RECEPTION_LIST_TO = '2100-12-31';

export function createGoodsReceptionsService(request: RequestFn) {
  return {
    listGoodsReceptions(params: ListGoodsReceptionsParams = {}): Promise<GoodsReceptionListDto[]> {
      const sp = new URLSearchParams();
      if (params.status) sp.set('status', params.status);
      if (params.sellerId != null) sp.set('sellerId', String(params.sellerId));
      const fromDate = params.fromDate ?? DEFAULT_RECEPTION_LIST_FROM;
      const toDate = params.toDate ?? DEFAULT_RECEPTION_LIST_TO;
      sp.set('fromDate', fromDate);
      sp.set('toDate', toDate);
      const qs = sp.toString();
      return request<GoodsReceptionListDto[]>(`/api/warehouse/receptions?${qs}`);
    },

    getGoodsReception(id: number): Promise<GoodsReceptionDetailsDto> {
      return request<GoodsReceptionDetailsDto>(`/api/warehouse/receptions/${id}`);
    },

    acceptGoodsReception(id: number): Promise<GoodsReceptionDetailsDto> {
      return request<GoodsReceptionDetailsDto>(`/api/warehouse/receptions/${id}/accept`, {
        method: 'POST',
      });
    },
  };
}
