package com.prostor.prostorApp.modules.warehouse.dto;

import com.prostor.prostorApp.modules.warehouse.model.ReceptionStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class GoodsReceptionListResponse {
    private Integer id;
    private Integer sellerId;
    private String sellerCompanyName;
    private ReceptionStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime acceptedAt;
    private Integer acceptedByWarehouseManagerId;
    private long positionsCount;
}
