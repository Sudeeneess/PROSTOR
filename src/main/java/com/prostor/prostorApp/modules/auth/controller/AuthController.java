package com.prostor.prostorApp.modules.auth.controller;

import com.prostor.prostorApp.modules.auth.dto.LoginRequest;
import com.prostor.prostorApp.modules.auth.dto.LoginResponse;
import com.prostor.prostorApp.modules.auth.dto.RegisterRequest;
import com.prostor.prostorApp.modules.auth.dto.RegisterResponse;
import com.prostor.prostorApp.modules.admin.repository.AdministratorRepository;
import com.prostor.prostorApp.modules.auth.service.AuthService;
import com.prostor.prostorApp.modules.user.repository.CustomerRepository;
import com.prostor.prostorApp.modules.user.repository.SellerRepository;
import com.prostor.prostorApp.modules.user.repository.UserRepository;
import com.prostor.prostorApp.modules.user.repository.WarehouseManagerRepository;
import com.prostor.prostorApp.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthService authService;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final AdministratorRepository administratorRepository;
    private final SellerRepository sellerRepository;
    private final WarehouseManagerRepository warehouseManagerRepository;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Попытка входа: {}", loginRequest.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.replace("ROLE_", ""))
                .orElse("CUSTOMER");

        String token = jwtTokenProvider.generateToken(userDetails.getUsername(), role);

        LoginResponse body = new LoginResponse();
        body.setToken(token);
        body.setType("Bearer");
        body.setUsername(userDetails.getUsername());
        body.setRole(role);
        body.setExpiresIn(jwtTokenProvider.getExpirationMs());

        userRepository.findByUserName(userDetails.getUsername()).ifPresent(user -> {
            int uid = user.getId();
            switch (role) {
                case "CUSTOMER" -> customerRepository.findByUserId(uid)
                        .ifPresent(c -> body.setCustomerId(c.getId()));
                case "ADMIN" -> administratorRepository.findByUserId(uid)
                        .ifPresent(a -> body.setAdminId(a.getId()));
                case "SELLER" -> sellerRepository.findByUserId(uid)
                        .ifPresent(s -> body.setSellerId(s.getId()));
                case "WAREHOUSE_MANAGER" -> warehouseManagerRepository.findByUserId(uid)
                        .ifPresent(wm -> body.setWarehouseManagerId(wm.getId()));
                default -> { /* no role-specific profile id */ }
            }
        });

        log.info("Успешный вход: {}, роль: {}", userDetails.getUsername(), role);

        return ResponseEntity.ok(body);
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Попытка регистрации: username={}, role={}", request.getUsername(), request.getRole());

        RegisterResponse response = authService.register(request);

        log.info("Успешная регистрация: username={}, role={}", response.getUsername(), response.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}