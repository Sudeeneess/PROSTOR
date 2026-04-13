package com.prostor.prostorApp.modules.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SizeRequest {
    @NotBlank(message = "Название размера обязательно")
    @Size(max = 30, message = "Название размера не должно превышать 30 символов")
    private String name;
}