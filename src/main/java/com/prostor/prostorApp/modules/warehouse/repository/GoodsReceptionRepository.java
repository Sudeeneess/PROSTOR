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
public interface GoodsReceptionRepository extends JpaRepository<GoodsReception, Integer> {

    Optional<GoodsReception> findFirstBySellerIdAndStatusOrderByCreatedAtDesc(Integer sellerId, ReceptionStatus status);

    @Query("""
            SELECT
                gr.id AS id,
                s.id AS sellerId,
                s.companyName AS sellerCompanyName,
                gr.status AS status,
                gr.createdAt AS createdAt,
                gr.acceptedAt AS acceptedAt,
                wm.id AS acceptedByWarehouseManagerId,
                COUNT(p.id) AS positionsCount
            FROM GoodsReception gr
            JOIN gr.seller s
            LEFT JOIN gr.acceptedByWarehouseManager wm
            LEFT JOIN gr.products p
            WHERE (:status IS NULL OR gr.status = :status)
              AND (:sellerId IS NULL OR s.id = :sellerId)
              AND (:fromDate IS NULL OR gr.createdAt >= :fromDate)
              AND (:toDate IS NULL OR gr.createdAt <= :toDate)
            GROUP BY gr.id, s.id, s.companyName, gr.status, gr.createdAt, gr.acceptedAt, wm.id
            ORDER BY gr.createdAt DESC
            """)
    List<GoodsReceptionListRow> findForWarehouseList(
            @Param("status") ReceptionStatus status,
            @Param("sellerId") Integer sellerId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
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
