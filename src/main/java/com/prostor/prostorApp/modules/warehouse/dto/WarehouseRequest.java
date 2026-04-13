package com.prostor.prostorApp.modules.warehouse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class WarehouseRequest {
    @NotNull(message = "ID менеджера склада обязателен")
    private Integer warehouseManagerId;

    @NotBlank(message = "Адрес склада обязателен")
    @Size(max = 100, message = "Адрес не должен превышать 100 символов")
    private String warehouseAddress;
}
