package com.prostor.prostorApp.modules.warehouse.repository;

import com.prostor.prostorApp.modules.warehouse.model.WarehouseStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    @Modifying
    @Query("UPDATE WarehouseStock ws SET ws.quantity = ws.quantity - :quantity, " +
            "ws.reservedQuantity = ws.reservedQuantity + :quantity " +
            "WHERE ws.product.id = :productId AND ws.quantity >= :quantity")
    int reserveProduct(@Param("productId") Integer productId, @Param("quantity") int quantity);

    @Modifying
    @Query("UPDATE WarehouseStock ws SET ws.quantity = ws.quantity + :quantity, " +
            "ws.reservedQuantity = ws.reservedQuantity - :quantity " +
            "WHERE ws.product.id = :productId AND ws.reservedQuantity >= :quantity")
    int releaseProduct(@Param("productId") Integer productId, @Param("quantity") int quantity);
}