package com.prostor.prostorApp.modules.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Название категории обязательно")
    @Size(max = 50, message = "Название категории не должно превышать 50 символов")
    private String categoryName;
}
