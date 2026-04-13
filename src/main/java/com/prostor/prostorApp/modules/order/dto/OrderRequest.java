package com.prostor.prostorApp.modules.order.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    @NotNull
    private Integer customerId;

    private Integer statusId;

    @NotNull
    @Size(min = 1)
    private List<OrderItemRequest> items;
}
