package com.prostor.prostorApp.modules.auth.service;

import com.prostor.prostorApp.modules.admin.model.Administrator;
import com.prostor.prostorApp.modules.admin.repository.AdministratorRepository;
import com.prostor.prostorApp.modules.auth.dto.RegisterRequest;
import com.prostor.prostorApp.modules.auth.dto.RegisterResponse;
import com.prostor.prostorApp.modules.user.model.*;
import com.prostor.prostorApp.modules.user.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CustomerRepository customerRepository;
    private final SellerRepository sellerRepository;
    private final AdministratorRepository administratorRepository;
    private final WarehouseManagerRepository warehouseManagerRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String ROLE_CUSTOMER = "CUSTOMER";
    private static final String ROLE_SELLER = "SELLER";
    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_WAREHOUSE_MANAGER = "WAREHOUSE_MANAGER";

    public RegisterResponse register(RegisterRequest request) {
        String roleName = request.getRole().toUpperCase();

        if (!ROLE_CUSTOMER.equals(roleName) && !ROLE_SELLER.equals(roleName)) {
            throw new RuntimeException("Самостоятельная регистрация доступна только для покупателей и продавцов");
        }

        if (userRepository.findByUserName(request.getUsername()).isPresent()) {
            throw new RuntimeException("Пользователь с именем '" + request.getUsername() + "' уже существует");
        }

        if (userRepository.existsByContactPhone(request.getPhone())) {
            throw new RuntimeException("Телефон '" + request.getPhone() + "' уже зарегистрирован");
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Роль '" + roleName + "' не найдена в системе"));

        if (ROLE_SELLER.equals(roleName)) {
            validateSellerFields(request);
        }

        User user = createUser(request, role);
        User savedUser = userRepository.save(user);

        createRoleSpecificRecord(savedUser, request);

        log.info("Успешная регистрация: username={}, role={}", savedUser.getUserName(), roleName);

        return new RegisterResponse(
                (long) savedUser.getId(),
                savedUser.getUserName(),
                roleName,
                "Регистрация успешно завершена"
        );
    }

    private void validateSellerFields(RegisterRequest request) {
        if (request.getInn() == null || request.getInn().isBlank()) {
            throw new RuntimeException("Для регистрации продавца необходимо указать ИНН");
        }
        if (request.getCompanyName() == null || request.getCompanyName().isBlank()) {
            throw new RuntimeException("Для регистрации продавца необходимо указать название компании");
        }
        if (sellerRepository.existsByInn(request.getInn())) {
            throw new RuntimeException("ИНН '" + request.getInn() + "' уже зарегистрирован");
        }
    }

    private User createUser(RegisterRequest request, Role role) {
        User user = new User();
        user.setUserName(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setContactPhone(request.getPhone());
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());
        return user;
    }

    private void createRoleSpecificRecord(User user, RegisterRequest request) {
        String roleName = user.getRole().getName().toUpperCase();

        switch (roleName) {
            case ROLE_CUSTOMER:
                Customer customer = new Customer();
                customer.setUser(user);
                customerRepository.save(customer);
                log.debug("Создана запись Customer для user: {}", user.getUserName());
                break;

            case ROLE_SELLER:
                Seller seller = new Seller();
                seller.setUser(user);
                seller.setInn(request.getInn());
                seller.setCompanyName(request.getCompanyName());
                sellerRepository.save(seller);
                log.debug("Создана запись Seller для user: {}, компания: {}", user.getUserName(), request.getCompanyName());
                break;

            case ROLE_ADMIN:
                Administrator admin = new Administrator();
                admin.setUser(user);
                administratorRepository.save(admin);
                log.debug("Создана запись Administrator для user: {}", user.getUserName());
                break;

            case ROLE_WAREHOUSE_MANAGER:
                WarehouseManager wm = new WarehouseManager();
                wm.setUser(user);
                warehouseManagerRepository.save(wm);
                log.debug("Создана запись WarehouseManager для user: {}", user.getUserName());
                break;

            default:
                log.warn("Неизвестная роль: {}, запись не создана", roleName);
        }
    }
}