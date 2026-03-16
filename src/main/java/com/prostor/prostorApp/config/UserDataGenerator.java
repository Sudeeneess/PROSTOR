package com.prostor.prostorApp.config;

import com.prostor.prostorApp.modules.user.model.Role;
import com.prostor.prostorApp.modules.user.model.User;
import com.prostor.prostorApp.modules.user.repository.RoleRepository;
import com.prostor.prostorApp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class UserDataGenerator implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        createRoleIfNotExists("ADMIN");
        createRoleIfNotExists("CUSTOMER");
        createRoleIfNotExists("SELLER");
        createRoleIfNotExists("WAREHOUSE_MANAGER");

        createUser("admin_user", "admin123", "ADMIN", "11111111111");
        createUser("john_doe", "cust123", "CUSTOMER", "22222222222");
        createUser("jane_smith", "cust456", "CUSTOMER", "33333333333");
        createUser("seller_pro", "seller123", "SELLER", "44444444444");
        createUser("warehouse_mgr", "ware123", "WAREHOUSE_MANAGER", "55555555555");
    }

    private void createRoleIfNotExists(String name) {
        if (!roleRepository.existsByName(name)) {
            Role role = new Role();
            role.setName(name);
            roleRepository.save(role);
        }
    }

    private void createUser(String username, String password, String roleName, String phone) {
        Role role = roleRepository.findByName(roleName).orElseThrow();

        User user = new User();
        user.setUserName(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setContactPhone(phone);
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);
    }
}