package com.prostor.prostorApp.modules.order.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payments_status_id", nullable = false)
    private PaymentsStatus paymentsStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orders_items_id", nullable = false)
    private OrderItem orderItem;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
