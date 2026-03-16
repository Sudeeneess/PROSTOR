package com.prostor.prostorApp.modules.auth.controller;

import com.prostor.prostorApp.modules.auth.dto.LoginRequest;
import com.prostor.prostorApp.modules.auth.dto.LoginResponse;
import com.prostor.prostorApp.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login attempt for user: {}", loginRequest.getUsername());

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

        String redirectUrl = switch (role) {
            case "ADMIN" -> "/admin/dashboard";
            case "SELLER" -> "/seller/dashboard";
            case "WAREHOUSE_MANAGER" -> "/warehouse/dashboard";
            default -> "/customer/dashboard";
        };

        log.info("User {} logged in successfully with role {}", userDetails.getUsername(), role);

        return ResponseEntity.ok(new LoginResponse(
                token,
                userDetails.getUsername(),
                role,
                jwtTokenProvider.getExpirationMs(),
                redirectUrl
        ));
    }
}