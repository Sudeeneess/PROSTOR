package com.prostor.prostorApp.modules.order.repository;

import com.prostor.prostorApp.modules.order.model.OrderMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderMovementRepository extends JpaRepository<OrderMovement, Integer> {

    List<OrderMovement> findByWarehouseId(Integer warehouseId);

    List<OrderMovement> findByMovementsStatusId(Integer statusId);

    List<OrderMovement> findByOrderItemId(Integer orderItemId);
}
