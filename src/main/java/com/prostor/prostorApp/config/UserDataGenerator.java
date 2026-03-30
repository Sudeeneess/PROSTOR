package com.prostor.prostorApp.config;

import com.prostor.prostorApp.modules.admin.model.Administrator;
import com.prostor.prostorApp.modules.admin.repository.AdministratorRepository;
import com.prostor.prostorApp.modules.user.model.Role;
import com.prostor.prostorApp.modules.user.model.User;
import com.prostor.prostorApp.modules.user.model.WarehouseManager;
import com.prostor.prostorApp.modules.user.repository.RoleRepository;
import com.prostor.prostorApp.modules.user.repository.UserRepository;
import com.prostor.prostorApp.modules.user.repository.WarehouseManagerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserDataGenerator implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdministratorRepository administratorRepository;
    private final WarehouseManagerRepository warehouseManagerRepository;

    @Override
    public void run(String... args) {
        // ГЛАВНАЯ ПРОВЕРКА: если в БД уже есть пользователи — ничего не делаем
        if (userRepository.count() > 0) {
            log.info("Database already contains {} users. Skipping test data generation.",
                    userRepository.count());
            return;
        }

        log.warn("========================================");
        log.warn("GENERATING TEST USERS (FIRST RUN ONLY)");
        log.warn("========================================");

        // Создаем роли, если их нет
        createRoleIfNotExists("ADMIN");
        createRoleIfNotExists("CUSTOMER");
        createRoleIfNotExists("SELLER");
        createRoleIfNotExists("WAREHOUSE_MANAGER");

        // Создаем тестовых пользователей
        createUserWithRole("admin_user", "admin123", "ADMIN", "11111111111");
        createUserWithRole("john_doe", "cust123", "CUSTOMER", "22222222222");
        createUserWithRole("jane_smith", "cust123", "CUSTOMER", "33333333333");
        createUserWithRole("seller_pro", "seller123", "SELLER", "44444444444");
        createUserWithRole("warehouse_mgr", "ware123", "WAREHOUSE_MANAGER", "55555555555");

        log.info("Test users generated successfully!");
        log.info("  Admin: admin_user / admin123");
        log.info("  Customer: john_doe / cust123");
        log.info("  Seller: seller_pro / seller123");
        log.info("  Warehouse Manager: warehouse_mgr / ware123");
    }

    private void createRoleIfNotExists(String name) {
        if (!roleRepository.existsByName(name)) {
            Role role = new Role();
            role.setName(name);
            roleRepository.save(role);
            log.debug("Created role: {}", name);
        }
    }

    private void createUserWithRole(String username, String rawPassword, String roleName, String phone) {
        // Дополнительная проверка на случай, если пользователь уже существует
        if (userRepository.findByUserName(username).isPresent()) {
            log.debug("User {} already exists, skipping", username);
            return;
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));

        User user = new User();
        user.setUserName(username);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setContactPhone(phone);
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        log.debug("Created user: {} with role: {}", username, roleName);

        // Создаем связующие записи для ADMIN и WAREHOUSE_MANAGER
        if ("ADMIN".equals(roleName)) {
            if (!administratorRepository.existsByUserId(savedUser.getId())) {
                Administrator admin = new Administrator();
                admin.setUser(savedUser);
                administratorRepository.save(admin);
                log.debug("Created Administrator record for user: {}", username);
            }
        } else if ("WAREHOUSE_MANAGER".equals(roleName)) {
            if (!warehouseManagerRepository.existsByUserId(savedUser.getId())) {
                WarehouseManager wm = new WarehouseManager();
                wm.setUser(savedUser);
                warehouseManagerRepository.save(wm);
                log.debug("Created WarehouseManager record for user: {}", username);
            }
        }
    }
}