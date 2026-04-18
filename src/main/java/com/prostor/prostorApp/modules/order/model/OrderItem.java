package com.prostor.prostorApp.modules.order.model;

import com.prostor.prostorApp.modules.product.model.Product;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orders_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_returns_id")
    private OrderReturn orderReturn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "products_id", nullable = false)
    private Product product;

    @Column(name = "is_ordered")
    private Boolean isOrdered = false;

    @Column(name = "is_finalized")
    private Boolean isFinalized = false;

    @Column(name = "amount", nullable = false)
    private double amount;

    @Column(name = "seller_commission", nullable = false)
    private double sellerCommission;

    @Column(name = "net_payout", nullable = false)
    private double netPayout;

    @Column(name = "sold_at")
    private LocalDateTime soldAt;
}