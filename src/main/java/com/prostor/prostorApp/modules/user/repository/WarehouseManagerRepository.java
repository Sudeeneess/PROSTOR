package com.prostor.prostorApp.modules.user.repository;

import com.prostor.prostorApp.modules.user.model.WarehouseManager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WarehouseManagerRepository extends JpaRepository<WarehouseManager, Integer> {
    Optional<WarehouseManager> findByUserId(Integer userId);
    boolean existsByUserId(Integer userId);
}
