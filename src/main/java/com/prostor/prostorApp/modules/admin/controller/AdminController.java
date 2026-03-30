package com.prostor.prostorApp.modules.admin.controller;

import com.prostor.prostorApp.modules.admin.dto.AdministratorDto;
import com.prostor.prostorApp.modules.admin.model.Administrator;
import com.prostor.prostorApp.modules.admin.repository.AdministratorRepository;
import com.prostor.prostorApp.modules.user.dto.UserCreateRequest;
import com.prostor.prostorApp.modules.user.dto.UserResponse;
import com.prostor.prostorApp.modules.user.model.User;
import com.prostor.prostorApp.modules.user.repository.UserRepository;
import com.prostor.prostorApp.modules.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdministratorRepository administratorRepository;
    private final UserRepository userRepository;
    private final UserService userService;  // <-- ДОБАВИТЬ

    // ==================== Статистика и системная информация ====================

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        log.info("ADMIN: Getting dashboard statistics");

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalAdmins", administratorRepository.count());
        stats.put("activeSessions", "N/A");

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/system/info")
    public ResponseEntity<Map<String, Object>> getSystemInfo() {
        log.info("ADMIN: Getting system information");

        Map<String, Object> info = new HashMap<>();
        info.put("application", "Prostor App");
        info.put("version", "1.0.0");
        info.put("environment", "development");
        info.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(info);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("database", userRepository.count() > 0 ? "Connected" : "No data");
        return ResponseEntity.ok(health);
    }

    // ==================== Управление пользователями ====================

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        log.info("ADMIN: Getting all users");
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable int id) {
        log.info("ADMIN: Getting user by id: {}", id);
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/users/username/{username}")
    public ResponseEntity<UserResponse> getUserByUsername(@PathVariable String username) {
        log.info("ADMIN: Getting user by username: {}", username);
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @GetMapping("/users/role/{roleId}")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable int roleId) {
        log.info("ADMIN: Getting users by role id: {}", roleId);
        return ResponseEntity.ok(userService.getUsersByRole(roleId));
    }

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        log.info("ADMIN: Creating new user: {}", request.getUserName());
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable int id,
            @Valid @RequestBody UserCreateRequest request) {
        log.info("ADMIN: Updating user with id: {}", id);
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        log.info("ADMIN: Deleting user with id: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Управление администраторами ====================

    @GetMapping("/admins")
    public ResponseEntity<List<AdministratorDto>> getAllAdmins() {
        log.info("ADMIN: Getting all administrators");

        List<AdministratorDto> admins = administratorRepository.findAll().stream()
                .map(this::convertToAdminDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(admins);
    }

    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUserName(user.getUserName());
        response.setContactPhone(user.getContactPhone());
        response.setCreatedAt(user.getCreatedAt());

        if (user.getRole() != null) {
            com.prostor.prostorApp.modules.user.dto.RoleDto roleDto =
                    new com.prostor.prostorApp.modules.user.dto.RoleDto();
            roleDto.setId(user.getRole().getId());
            roleDto.setName(user.getRole().getName());
            response.setRole(roleDto);
        }

        return response;
    }

    private AdministratorDto convertToAdminDto(Administrator admin) {
        AdministratorDto dto = new AdministratorDto();
        dto.setId(admin.getId());
        dto.setUserId(admin.getUser().getId());
        return dto;
    }
}