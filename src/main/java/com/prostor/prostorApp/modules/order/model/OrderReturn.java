package com.prostor.prostorApp.modules.order.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_returns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderReturn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_returns_status_id", nullable = false)
    private OrderReturnsStatus orderReturnsStatus;

    @Column(name = "return_reason")
    private String returnReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
