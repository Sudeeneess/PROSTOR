package com.prostor.prostorApp.modules.user.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SellerProductResponse {
    private Integer id;
    private String name;
    private double price;
    private Integer sellerId;
    private Integer categoryId;
    private Integer parentId;
    private LocalDateTime createdAt;
    private Integer availableQuantity;
}
