package com.prostor.prostorApp.modules.order.repository;

import com.prostor.prostorApp.modules.order.model.OrderReturnsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderReturnsStatusRepository extends JpaRepository<OrderReturnsStatus, Integer> {
}
