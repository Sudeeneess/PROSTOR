package com.prostor.prostorApp.modules.warehouse.repository.projection;

import com.prostor.prostorApp.modules.warehouse.model.ReceptionStatus;

import java.time.LocalDateTime;

public interface GoodsReceptionListRow {
    Integer getId();
    Integer getSellerId();
    String getSellerCompanyName();
    ReceptionStatus getStatus();
    LocalDateTime getCreatedAt();
    LocalDateTime getAcceptedAt();
    Integer getAcceptedByWarehouseManagerId();
    Long getPositionsCount();
}
