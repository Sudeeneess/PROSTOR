package com.prostor.prostorApp.modules.user.repository;

import com.prostor.prostorApp.modules.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByUserName(String userName);

    Optional<User> findByContactPhone(String contactPhone);

    boolean existsByContactPhone(String contactPhone);

    List<User> findByRoleId(int roleId);

    List<User> findAllByOrderByCreatedAtDesc();
}
