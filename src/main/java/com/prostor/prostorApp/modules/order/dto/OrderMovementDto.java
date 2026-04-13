package com.prostor.prostorApp.modules.order.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OrderMovementDto {
    private Integer id;
    private Integer warehouseId;
    private Integer orderItemId;
    private String status;
    private LocalDateTime createdAt;
}
