package com.prostor.prostorApp.modules.order.model;

import com.prostor.prostorApp.modules.warehouse.model.Warehouse;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders_movements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orders_items_id", nullable = false)
    private OrderItem orderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movements_status_id", nullable = false)
    private MovementsStatus movementsStatus;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
