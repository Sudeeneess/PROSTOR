package com.prostor.prostorApp.modules.order.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private Integer id;
    private Integer customerId;
    private OrderStatusDto status;
    private LocalDateTime orderDate;
    private double totalAmount;
    private List<OrderItemResponse> items;
}
