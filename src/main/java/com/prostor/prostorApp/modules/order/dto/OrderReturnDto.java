package com.prostor.prostorApp.modules.order.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OrderReturnDto {
    private Integer id;
    private String status;
    private String returnReason;
    private LocalDateTime createdAt;
}
