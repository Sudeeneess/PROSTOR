package com.prostor.prostorApp.modules.product.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ProductCardResponse {
    private Integer id;
    private Integer productId;
    private BrandDto brand;
    private SizeDto size;
    private String description;
    private String type;
    private List<Map<String, Object>> photo;
    private Boolean isActive;
}