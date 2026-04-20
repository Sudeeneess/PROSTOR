package com.prostor.prostorApp.modules.order.repository;

import com.prostor.prostorApp.modules.order.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {

    // Все позиции заказа
    List<OrderItem> findByOrderId(Integer orderId);
    void deleteByOrderId(Integer orderId);

    // Все позиции с конкретным товаром
    List<OrderItem> findByProductId(Integer productId);

    // Товары, ожидающие подтверждения (is_ordered = true, is_finalized = false)
    List<OrderItem> findByIsOrderedTrueAndIsFinalizedFalse();

    // Товары, связанные с возвратом
    List<OrderItem> findByOrderReturnId(Integer orderReturnId);
    long countByOrderReturnId(Integer orderReturnId);

    boolean existsByProductId(Integer productId);

    @Query("""
            SELECT COUNT(oi)
            FROM OrderItem oi
            WHERE oi.product.seller.id = :sellerId
              AND UPPER(oi.order.ordersStatus.name) IN :statusNames
            """)
    long countBySellerIdAndOrderStatusNames(@Param("sellerId") Integer sellerId,
                                            @Param("statusNames") Collection<String> statusNames);
}