package com.prostor.prostorApp.modules.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SizeDto {
    private Integer id;

    @NotBlank
    @Size(max = 30)
    private String name;
}
