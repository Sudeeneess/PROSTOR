package com.prostor.prostorApp.modules.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BrandDto {
    private Integer id;

    @NotBlank
    @Size(max = 50)
    private String name;
}
