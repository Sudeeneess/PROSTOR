package com.prostor.prostorApp.modules.order.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SellerOrdersDashboardResponse {

    private long newProducts;
    private long assembling;
    private long onTheWay;
    private long sold;
}
