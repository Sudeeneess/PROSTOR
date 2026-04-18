package com.prostor.prostorApp.modules.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderStatusDto {
    private Integer id;
    @NotBlank
    private String name;
}
