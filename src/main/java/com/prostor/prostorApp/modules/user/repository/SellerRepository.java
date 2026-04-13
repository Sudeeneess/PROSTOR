package com.prostor.prostorApp.modules.user.repository;

import com.prostor.prostorApp.modules.user.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Integer> {
    Optional<Seller> findByUserId(Integer userId);
    Optional<Seller> findByInn(String inn);
    Optional<Seller> findByCompanyName(String companyName);
    boolean existsByInn(String inn);
}
