package com.prostor.prostorApp.modules.order.repository;

import com.prostor.prostorApp.modules.order.model.MovementsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MovementsStatusRepository extends JpaRepository<MovementsStatus, Integer> {
    Optional<MovementsStatus> findByName(String name);
}
