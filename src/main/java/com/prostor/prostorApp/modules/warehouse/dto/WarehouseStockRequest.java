package com.prostor.prostorApp.modules.warehouse.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WarehouseStockRequest {
    @NotNull(message = "ID склада обязателен")
    private Integer warehouseId;

    @NotNull(message = "ID товара обязателен")
    private Integer productId;

    @NotNull(message = "Количество обязательно")
    @Min(value = 0, message = "Количество не может быть отрицательным")
    private Integer quantity;
}