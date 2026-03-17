package com.prostor.prostorApp.modules.warehouse.dto;

import lombok.Data;

@Data
public class WarehouseResponse {
    private Integer id;
    private Integer warehouseManagerId;
    private String warehouseAddress;
}