package com.prostor.prostorApp.modules.product.repository;

import com.prostor.prostorApp.modules.product.model.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SizeRepository extends JpaRepository<Size, Integer> {

    Optional<Size> findByName(String name);
    boolean existsByName(String name);
}
