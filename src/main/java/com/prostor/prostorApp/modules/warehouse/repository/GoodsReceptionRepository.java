package com.prostor.prostorApp.modules.warehouse.repository;

import com.prostor.prostorApp.modules.warehouse.model.GoodsReception;
import com.prostor.prostorApp.modules.warehouse.model.ReceptionStatus;
import com.prostor.prostorApp.modules.warehouse.repository.projection.GoodsReceptionListRow;
import com.prostor.prostorApp.modules.warehouse.repository.projection.GoodsReceptionProductRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GoodsReceptionRepository extends JpaRepository<GoodsReception, Integer>, GoodsReceptionRepositoryCustom {

    Optional<GoodsReception> findFirstBySellerIdAndStatusOrderByCreatedAtDesc(Integer sellerId, ReceptionStatus status);

    List<GoodsReceptionListRow> findForWarehouseList(
            ReceptionStatus status,
            Integer sellerId,
            LocalDateTime fromDate,
            LocalDateTime toDate
    );

    @Query("""
            SELECT
                p.id AS productId,
                p.name AS productName,
                COALESCE(SUM(ws.quantity), 0) AS quantityOnWarehouse
            FROM Product p
            LEFT JOIN p.warehouseStocks ws
            WHERE p.reception.id = :receptionId
            GROUP BY p.id, p.name
            ORDER BY p.id
            """)
    List<GoodsReceptionProductRow> findReceptionProductsWithStock(@Param("receptionId") Integer receptionId);
}
