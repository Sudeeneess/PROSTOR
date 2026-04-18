package com.prostor.prostorApp.modules.product.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ProductCardRequest {
    @NotNull
    private Integer productId;

    private Integer brandId;

    private Integer sizeId;

    @NotNull
    @Size(min = 1, message = "Описание не может быть пустым")
    private String description;

    @NotBlank
    @Size(max = 30)
    private String type;

    private List<Map<String, Object>> photo;

    private Boolean isActive = true;
}