package com.prostor.prostorApp.modules.order.repository;

import com.prostor.prostorApp.modules.order.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {

    // Все позиции заказа
    List<OrderItem> findByOrderId(Integer orderId);

    // Все позиции с конкретным товаром
    List<OrderItem> findByProductId(Integer productId);

    // Товары, ожидающие подтверждения (is_ordered = true, is_finalized = false)
    List<OrderItem> findByIsOrderedTrueAndIsFinalizedFalse();

    // Товары, связанные с возвратом
    List<OrderItem> findByOrderReturnId(Integer orderReturnId);
}