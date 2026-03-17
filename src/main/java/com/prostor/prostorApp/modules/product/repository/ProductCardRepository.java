package com.prostor.prostorApp.modules.product.repository;

import com.prostor.prostorApp.modules.product.model.ProductCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductCardRepository extends JpaRepository<ProductCard, Integer> {

    List<ProductCard> findByProductId(Integer productId);

    List<ProductCard> findByBrandId(Integer brandId);

    List<ProductCard> findByIsActiveTrue();
}
