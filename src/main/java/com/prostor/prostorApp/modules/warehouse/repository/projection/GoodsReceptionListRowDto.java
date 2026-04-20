package com.prostor.prostorApp.modules.warehouse.repository.projection;

import com.prostor.prostorApp.modules.warehouse.model.ReceptionStatus;

import java.time.LocalDateTime;

public class GoodsReceptionListRowDto implements GoodsReceptionListRow {
    private final Integer id;
    private final Integer sellerId;
    private final String sellerCompanyName;
    private final ReceptionStatus status;
    private final LocalDateTime createdAt;
    private final LocalDateTime acceptedAt;
    private final Integer acceptedByWarehouseManagerId;
    private final Long positionsCount;

    public GoodsReceptionListRowDto(
            Integer id,
            Integer sellerId,
            String sellerCompanyName,
            ReceptionStatus status,
            LocalDateTime createdAt,
            LocalDateTime acceptedAt,
            Integer acceptedByWarehouseManagerId,
            Long positionsCount
    ) {
        this.id = id;
        this.sellerId = sellerId;
        this.sellerCompanyName = sellerCompanyName;
        this.status = status;
        this.createdAt = createdAt;
        this.acceptedAt = acceptedAt;
        this.acceptedByWarehouseManagerId = acceptedByWarehouseManagerId;
        this.positionsCount = positionsCount;
    }

    @Override
    public Integer getId() {
        return id;
    }

    @Override
    public Integer getSellerId() {
        return sellerId;
    }

    @Override
    public String getSellerCompanyName() {
        return sellerCompanyName;
    }

    @Override
    public ReceptionStatus getStatus() {
        return status;
    }

    @Override
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    @Override
    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }

    @Override
    public Integer getAcceptedByWarehouseManagerId() {
        return acceptedByWarehouseManagerId;
    }

    @Override
    public Long getPositionsCount() {
        return positionsCount;
    }
}
