package com.prostor.prostorApp.modules.product.repository;

import com.prostor.prostorApp.modules.product.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Integer> {

    Optional<Brand> findByName(String name);
    boolean existsByName(String name);

}
