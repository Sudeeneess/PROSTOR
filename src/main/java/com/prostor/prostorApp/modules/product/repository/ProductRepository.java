package com.prostor.prostorApp.modules.product.repository;

import com.prostor.prostorApp.modules.product.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    Page<Product> findByCategoryId(Integer categoryId, Pageable pageable);

    List<Product> findBySellerId(Integer sellerId);

    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Product> findByPriceBetween(double minPrice, double maxPrice, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
            "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
            "(:sellerId IS NULL OR p.seller.id = :sellerId) AND " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> filterProducts(@Param("categoryId") Integer categoryId,
                                 @Param("sellerId") Integer sellerId,
                                 @Param("minPrice") double minPrice,
                                 @Param("maxPrice") double maxPrice,
                                 Pageable pageable);

    boolean existsByNameAndSellerId(String name, Integer sellerId);
}
