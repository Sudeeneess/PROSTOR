package com.prostor.prostorApp.modules.admin.repository;

import com.prostor.prostorApp.modules.admin.model.Administrator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdministratorRepository extends JpaRepository<Administrator, Integer> {
    Optional<Administrator> findByUserId(Integer userId);
    boolean existsByUserId(Integer userId);
}
