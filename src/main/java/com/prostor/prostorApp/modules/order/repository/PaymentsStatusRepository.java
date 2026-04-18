package com.prostor.prostorApp.modules.order.repository;

import com.prostor.prostorApp.modules.order.model.PaymentsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentsStatusRepository extends JpaRepository<PaymentsStatus, Integer> {
    Optional<PaymentsStatus> findByName(String name);
}
