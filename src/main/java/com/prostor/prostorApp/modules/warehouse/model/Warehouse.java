package com.prostor.prostorApp.modules.warehouse.model;

import com.prostor.prostorApp.modules.user.model.WarehouseManager;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "warehouse")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_manager_id", nullable = false)
    private WarehouseManager warehouseManager;

    @Column(name = "warehouse_address", nullable = false, length = 100)
    private String warehouseAddress;
}