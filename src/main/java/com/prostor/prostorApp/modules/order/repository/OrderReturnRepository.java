package com.prostor.prostorApp.modules.order.repository;

import com.prostor.prostorApp.modules.order.model.OrderReturn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderReturnRepository extends JpaRepository<OrderReturn, Integer> {

    List<OrderReturn> findByOrderReturnsStatusId(Integer statusId);
}
