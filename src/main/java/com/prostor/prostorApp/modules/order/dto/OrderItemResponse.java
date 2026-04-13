package com.prostor.prostorApp.modules.order.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OrderItemResponse {
    private Integer id;
    private Integer productId;
    private String productName;
    private double amount;
    private double sellerCommission;
    private double netPayout;
    private Boolean isOrdered;
    private Boolean isFinalized;
    private LocalDateTime soldAt;
}