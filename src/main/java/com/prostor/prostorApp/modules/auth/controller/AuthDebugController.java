package com.prostor.prostorApp.modules.auth.controller;

import com.prostor.prostorApp.modules.user.dto.UserResponse;
import com.prostor.prostorApp.modules.user.service.UserService;
import com.prostor.prostorApp.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
//@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class AuthDebugController {

    private final UserService userService;              // Вместо UserRepository
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        log.info("=== DEBUG: Getting all users ===");
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<UserResponse> getUserByUsername(@PathVariable String username) {
        log.info("=== DEBUG: Getting user by username: {} ===", username);
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @PostMapping("/test-password")
    public ResponseEntity<Map<String, Object>> testPassword(@RequestBody Map<String, String> request) {
        String rawPassword = request.get("password");
        String encodedPassword = request.get("encoded");

        log.info("=== DEBUG: Testing password ===");

        boolean matches = passwordEncoder.matches(rawPassword, encodedPassword);
        String newEncoded = passwordEncoder.encode(rawPassword);

        Map<String, Object> response = new HashMap<>();
        response.put("raw_password", rawPassword);
        response.put("encoded_password", encodedPassword);
        response.put("matches", matches);
        response.put("new_encoded", newEncoded);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/try-login")
    public ResponseEntity<Map<String, Object>> tryLogin(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        log.info("=== DEBUG: Trying manual login for user: {} ===", username);

        Map<String, Object> response = new HashMap<>();
        response.put("username", username);

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            response.put("authentication_success", true);
            response.put("authenticated_user", authentication.getName());
            response.put("authenticated_authorities", authentication.getAuthorities().toString());

            UserResponse user = userService.getUserByUsername(username);

            String token = jwtTokenProvider.generateToken(username, user.getRole().getName());
            response.put("token_generated", true);
            response.put("token_preview", token.substring(0, Math.min(20, token.length())) + "...");

        } catch (BadCredentialsException e) {
            response.put("authentication_success", false);
            response.put("error", "Bad credentials: " + e.getMessage());
        } catch (Exception e) {
            response.put("authentication_success", false);
            response.put("error", e.getClass().getSimpleName() + ": " + e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Map<String, Object>>> getAllRoles() {
        log.info("=== DEBUG: Getting all roles ===");
        return ResponseEntity.ok(userService.getRolesWithUserCount());
    }


    @PostMapping("/simple-login")
    public ResponseEntity<Map<String, Object>> simpleLogin(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        Map<String, Object> response = new HashMap<>();

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            UserResponse user = userService.getUserByUsername(username);
            String token = jwtTokenProvider.generateToken(username, user.getRole().getName());

            response.put("success", true);
            response.put("username", username);
            response.put("role", user.getRole().getName());
            response.put("token_preview", token.substring(0, 20) + "...");

        } catch (BadCredentialsException e) {
            response.put("success", false);
            response.put("error", "Invalid username or password");
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user-authorities/{username}")
    public ResponseEntity<Map<String, Object>> getUserAuthorities(@PathVariable String username) {
        Map<String, Object> response = new HashMap<>();

        try {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            response.put("username", userDetails.getUsername());
            response.put("authorities", userDetails.getAuthorities().toString());
            response.put("authorities_list", userDetails.getAuthorities().stream()
                    .map(a -> a.getAuthority())
                    .toList());

        } catch (Exception e) {
            response.put("error", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }
}