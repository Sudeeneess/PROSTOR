package com.prostor.prostorApp.modules.warehouse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class WarehouseDto {
    private Integer id;

    @NotNull(message = "ID менеджера склада обязателен")
    private Integer warehouseManagerId;

    @NotBlank(message = "Адрес склада обязателен")
    @Size(max = 100)
    private String warehouseAddress;
}
