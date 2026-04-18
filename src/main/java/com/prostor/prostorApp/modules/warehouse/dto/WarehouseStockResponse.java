package com.prostor.prostorApp.modules.warehouse.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WarehouseStockResponse {
    private Integer id;
    private Integer warehouseId;
    private Integer productId;
    private String productName;
    private Integer quantity;
    private Integer reservedQuantity;
    private Integer soldQuantity;
    private LocalDateTime updatedAt;
}