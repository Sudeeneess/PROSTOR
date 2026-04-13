package com.prostor.prostorApp.modules.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;


@Data
public class ProductRequest {
    @NotBlank
    @Size(max = 150)
    private String name;

    @NotNull
    @Positive
    private double price;

    @NotNull
    private Integer sellerId;

    @NotNull
    private Integer categoryId;

    private Integer parentId;
}
