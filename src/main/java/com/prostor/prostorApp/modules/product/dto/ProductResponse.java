package com.prostor.prostorApp.modules.product.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProductResponse {
    private Integer id;
    private String name;
    private double  price;
    private Integer sellerId;
    private Integer categoryId;
    private Integer parentId;
    private LocalDateTime createdAt;
}
