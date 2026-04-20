package com.prostor.prostorApp.modules.warehouse.dto;

import lombok.Data;

@Data
public class GoodsReceptionProductResponse {
    private Integer productId;
    private String productName;
    private Integer quantityOnWarehouse;
}
