package com.prostor.prostorApp.modules.warehouse.repository;

import com.prostor.prostorApp.modules.warehouse.model.ReceptionStatus;
import com.prostor.prostorApp.modules.warehouse.repository.projection.GoodsReceptionListRow;

import java.time.LocalDateTime;
import java.util.List;

public interface GoodsReceptionRepositoryCustom {
    List<GoodsReceptionListRow> findForWarehouseList(
            ReceptionStatus status,
            Integer sellerId,
            LocalDateTime fromDate,
            LocalDateTime toDate
    );
}
