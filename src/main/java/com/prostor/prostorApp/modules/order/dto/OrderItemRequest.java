package com.prostor.prostorApp.modules.order.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;


@Data
public class OrderItemRequest {
    @NotNull
    private Integer productId;

    @NotNull
    @Positive
    private double amount;
}
