package com.prostor.prostorApp.modules.warehouse.repository;

import com.prostor.prostorApp.modules.warehouse.model.WarehouseStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseStockRepository extends JpaRepository<WarehouseStock, Integer> {

    Optional<WarehouseStock> findByWarehouseIdAndProductId(Integer warehouseId, Integer productId);

    List<WarehouseStock> findByProductId(Integer productId);

    List<WarehouseStock> findByWarehouseId(Integer warehouseId);

    List<WarehouseStock> findByQuantityLessThan(Integer threshold);

    @Query("SELECT SUM(ws.quantity) FROM WarehouseStock ws WHERE ws.product.id = :productId")
    Integer getTotalQuantityByProductId(@Param("productId") Integer productId);
}
