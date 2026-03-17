package com.prostor.prostorApp.modules.order.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PaymentDto {
    private Integer id;
    private Integer orderItemId;
    private String status;
    private LocalDateTime createdAt;
}