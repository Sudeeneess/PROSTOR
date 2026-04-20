export type ReceptionStatusDto = 'PENDING' | 'ACCEPTED';

export interface GoodsReceptionListDto {
  id: number;
  sellerId: number;
  sellerCompanyName: string;
  status: ReceptionStatusDto;
  createdAt: string;
  acceptedAt: string | null;
  acceptedByWarehouseManagerId: number | null;
  positionsCount: number;
}

export interface GoodsReceptionProductDto {
  productId: number;
  productName: string;
  quantityOnWarehouse: number;
}

export interface GoodsReceptionDetailsDto extends GoodsReceptionListDto {
  products: GoodsReceptionProductDto[];
}

export interface ListGoodsReceptionsParams {
  status?: ReceptionStatusDto;
  sellerId?: number;
  fromDate?: string;
  toDate?: string;
}
