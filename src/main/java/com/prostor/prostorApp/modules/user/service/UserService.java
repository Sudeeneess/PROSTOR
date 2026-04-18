package com.prostor.prostorApp.modules.user.service;

import com.prostor.prostorApp.modules.admin.model.Administrator;
import com.prostor.prostorApp.modules.admin.repository.AdministratorRepository;
import com.prostor.prostorApp.modules.user.dto.RoleDto;
import com.prostor.prostorApp.modules.user.dto.UserCreateRequest;
import com.prostor.prostorApp.modules.user.dto.UserResponse;
import com.prostor.prostorApp.modules.user.model.*;
import com.prostor.prostorApp.modules.user.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomerRepository customerRepository;
    private final SellerRepository sellerRepository;
    private final AdministratorRepository administratorRepository;
    private final WarehouseManagerRepository warehouseManagerRepository;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(int id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return convertToUserResponse(user);
    }

    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        return convertToUserResponse(user);
    }

    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.findByUserName(request.getUserName()).isPresent()) {
            throw new RuntimeException("Username already exists: " + request.getUserName());
        }

        if (userRepository.existsByContactPhone(request.getContactPhone())) {
            throw new RuntimeException("Phone number already exists: " + request.getContactPhone());
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + request.getRoleId()));

        User user = new User();
        user.setUserName(request.getUserName());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setContactPhone(request.getContactPhone());
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        log.info("Created user: {} with role: {}", savedUser.getUserName(), role.getName());

        createRoleSpecificRecord(savedUser);

        return convertToUserResponse(savedUser);
    }

    @Transactional
    public UserResponse updateUser(int id, UserCreateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (request.getUserName() != null) {
            userRepository.findByUserName(request.getUserName())
                    .ifPresent(existingUser -> {
                        if (existingUser.getId() != id) {
                            throw new RuntimeException("Username already exists: " + request.getUserName());
                        }
                    });
            user.setUserName(request.getUserName());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getContactPhone() != null) {
            user.setContactPhone(request.getContactPhone());
        }

        if (request.getRoleId() > 0 && (user.getRole() == null || user.getRole().getId() != request.getRoleId())) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role not found with id: " + request.getRoleId()));
            deleteRoleSpecificRecord(user);
            user.setRole(role);
            createRoleSpecificRecord(user);
        }

        User updatedUser = userRepository.save(user);
        log.info("Updated user with id: {}", id);
        return convertToUserResponse(updatedUser);
    }

    @Transactional
    public void deleteUser(int id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }

        User user = userRepository.findById(id).get();
        deleteRoleSpecificRecord(user);

        userRepository.deleteById(id);
        log.info("Deleted user with id: {}", id);
    }

    public List<UserResponse> getUsersByRole(int roleId) {
        return userRepository.findByRoleId(roleId).stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUserName(user.getUserName());
        response.setContactPhone(user.getContactPhone());
        response.setCreatedAt(user.getCreatedAt());

        if (user.getRole() != null) {
            RoleDto roleDto = new RoleDto();
            roleDto.setId(user.getRole().getId());
            roleDto.setName(user.getRole().getName());
            response.setRole(roleDto);
        }

        return response;
    }

    public List<Map<String, Object>> getRolesWithUserCount() {
        return roleRepository.findAll().stream()
                .map(role -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("role_id", role.getId());
                    map.put("role_name", role.getName());
                    map.put("users_count", userRepository.findByRoleId(role.getId()).size());
                    return map;
                })
                .toList();
    }

    private void createRoleSpecificRecord(User user) {
        String roleName = user.getRole().getName().toUpperCase();

        switch (roleName) {
            case "CUSTOMER":
                if (!customerRepository.existsByUserId(user.getId())) {
                    Customer customer = new Customer();
                    customer.setUser(user);
                    customerRepository.save(customer);
                    log.debug("Created Customer record for user: {}", user.getUserName());
                }
                break;

            case "SELLER":
                if (!sellerRepository.findByUserId(user.getId()).isPresent()) {
                    Seller seller = new Seller();
                    seller.setUser(user);
                    seller.setInn("000000000000"); // Временный ИНН, нужно будет обновить
                    seller.setCompanyName("Company");
                    sellerRepository.save(seller);
                    log.debug("Created Seller record for user: {}", user.getUserName());
                }
                break;

            case "ADMIN":
                if (!administratorRepository.existsByUserId(user.getId())) {
                    Administrator admin = new Administrator();
                    admin.setUser(user);
                    administratorRepository.save(admin);
                    log.debug("Created Administrator record for user: {}", user.getUserName());
                }
                break;

            case "WAREHOUSE_MANAGER":
                if (!warehouseManagerRepository.existsByUserId(user.getId())) {
                    WarehouseManager wm = new WarehouseManager();
                    wm.setUser(user);
                    warehouseManagerRepository.save(wm);
                    log.debug("Created WarehouseManager record for user: {}", user.getUserName());
                }
                break;

            default:
                log.warn("Unknown role: {}, skipping specific record creation", roleName);
        }
    }

    private void deleteRoleSpecificRecord(User user) {
        String roleName = user.getRole().getName().toUpperCase();

        switch (roleName) {
            case "CUSTOMER":
                customerRepository.findByUserId(user.getId())
                        .ifPresent(customerRepository::delete);
                break;

            case "SELLER":
                sellerRepository.findByUserId(user.getId())
                        .ifPresent(sellerRepository::delete);
                break;

            case "ADMIN":
                administratorRepository.findByUserId(user.getId())
                        .ifPresent(administratorRepository::delete);
                break;

            case "WAREHOUSE_MANAGER":
                warehouseManagerRepository.findByUserId(user.getId())
                        .ifPresent(warehouseManagerRepository::delete);
                break;
        }
    }
}