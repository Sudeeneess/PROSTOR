package com.prostor.prostorApp.modules.order.repository;

import com.prostor.prostorApp.modules.order.model.MovementsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovementsStatusRepository extends JpaRepository<MovementsStatus, Integer> {
}
