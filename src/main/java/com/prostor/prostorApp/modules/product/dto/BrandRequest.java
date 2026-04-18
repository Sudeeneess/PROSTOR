package com.prostor.prostorApp.modules.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BrandRequest {
    @NotBlank(message = "Название бренда обязательно")
    @Size(max = 50, message = "Название бренда не должно превышать 50 символов")
    private String name;
}
