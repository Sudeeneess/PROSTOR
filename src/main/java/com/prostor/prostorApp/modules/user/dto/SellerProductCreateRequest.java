package com.prostor.prostorApp.modules.user.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SellerProductCreateRequest {

    @NotBlank
    @Size(max = 150)
    private String name;

    @NotNull
    @Positive
    private Double price;

    @NotNull
    private Integer categoryId;

    private Integer parentId;

    @NotNull(message = "ID склада обязателен")
    private Integer warehouseId;

    @NotNull(message = "Начальное количество обязательно")
    @Min(value = 0, message = "Количество не может быть отрицательным")
    private Integer initialQuantity;
}
