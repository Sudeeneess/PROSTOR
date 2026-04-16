package com.prostor.prostorApp.modules.product.repository;

import com.prostor.prostorApp.modules.product.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    Page<Product> findByCategoryId(Integer categoryId, Pageable pageable);
    Page<Product> findBySellerId(Integer sellerId, Pageable pageable);
    List<Product> findBySellerId(Integer sellerId);
    Page<Product> findByPriceBetween(double minPrice, double maxPrice, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
            "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
            "(:sellerId IS NULL OR p.seller.id = :sellerId) AND " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
            "(:name IS NULL OR LOWER(p.name) LIKE CONCAT('%', LOWER(CAST(:name AS string)), '%'))")
    Page<Product> filterProducts(@Param("categoryId") Integer categoryId,
                                 @Param("sellerId") Integer sellerId,
                                 @Param("minPrice") Double minPrice,
                                 @Param("maxPrice") Double maxPrice,
                                 @Param("name") String name,
                                 Pageable pageable);

    boolean existsByNameAndSellerId(String name, Integer sellerId);

    long countBySellerIdAndCreatedAtGreaterThanEqual(Integer sellerId, LocalDateTime createdAt);
}