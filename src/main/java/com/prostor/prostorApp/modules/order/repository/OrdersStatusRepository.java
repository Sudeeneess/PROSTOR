package com.prostor.prostorApp.modules.order.repository;

import com.prostor.prostorApp.modules.order.model.OrdersStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrdersStatusRepository extends JpaRepository<OrdersStatus, Integer> {
}
