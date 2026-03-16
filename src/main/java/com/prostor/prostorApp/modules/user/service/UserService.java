package com.prostor.prostorApp.modules.user.service;

import com.prostor.prostorApp.modules.user.dto.RoleDto;
import com.prostor.prostorApp.modules.user.dto.UserCreateRequest;
import com.prostor.prostorApp.modules.user.dto.UserResponse;
import com.prostor.prostorApp.modules.user.model.Role;
import com.prostor.prostorApp.modules.user.model.User;
import com.prostor.prostorApp.modules.user.repository.RoleRepository;
import com.prostor.prostorApp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

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
        user.setPasswordHash(passwordEncoder.encode(request.getPassword())); // Хэшируем пароль!
        user.setContactPhone(request.getContactPhone());
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
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

        if (request.getPassword() != null) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getContactPhone() != null) {
            user.setContactPhone(request.getContactPhone());
        }

        if (request.getRoleId() > 0) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role not found with id: " + request.getRoleId()));
            user.setRole(role);
        }

        User updatedUser = userRepository.save(user);
        return convertToUserResponse(updatedUser);
    }

    @Transactional
    public void deleteUser(int id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
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
}