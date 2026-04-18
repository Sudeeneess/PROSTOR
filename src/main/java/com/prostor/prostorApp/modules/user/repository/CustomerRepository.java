package com.prostor.prostorApp.modules.user.repository;

import com.prostor.prostorApp.modules.user.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer,Integer> {

    Optional<Customer> findByUserId(Integer userId);
    boolean existsByUserId(Integer userId);
}
