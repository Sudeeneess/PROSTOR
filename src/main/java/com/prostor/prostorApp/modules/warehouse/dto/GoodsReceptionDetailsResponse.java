package com.prostor.prostorApp.modules.warehouse.dto;

import com.prostor.prostorApp.modules.warehouse.model.ReceptionStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class GoodsReceptionDetailsResponse {
    private Integer id;
    private Integer sellerId;
    private String sellerCompanyName;
    private ReceptionStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime acceptedAt;
    private Integer acceptedByWarehouseManagerId;
    private long positionsCount;
    private List<GoodsReceptionProductResponse> products;
}
