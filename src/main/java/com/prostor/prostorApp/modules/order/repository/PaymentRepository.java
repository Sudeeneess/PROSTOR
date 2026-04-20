package com.prostor.prostorApp.modules.order.repository;

import com.prostor.prostorApp.modules.order.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    List<Payment> findByPaymentsStatusId(Integer statusId);

    List<Payment> findByOrderItemId(Integer orderItemId);
    void deleteByOrderItemId(Integer orderItemId);
}
