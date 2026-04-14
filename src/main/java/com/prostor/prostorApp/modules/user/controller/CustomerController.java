package com.prostor.prostorApp.modules.user.controller;


import com.prostor.prostorApp.modules.user.model.Customer;
import com.prostor.prostorApp.modules.user.repository.CustomerRepository;
import com.prostor.prostorApp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getCustomerDashboard(
            @AuthenticationPrincipal User principal) {

        Integer customerId = userRepository.findByUserName(principal.getUsername())
                .flatMap(u -> customerRepository.findByUserId(u.getId()))
                .map(Customer::getId)
                .orElse(null);

        Map<String, Object> response = new HashMap<>();
        response.put("role", "CUSTOMER");
        response.put("username", principal.getUsername());
        response.put("message", "Добро пожаловать в личный кабинет покупателя");
        response.put("status", "ready");
        response.put("redirect", "/customer/dashboard");
        response.put("customerId", customerId);

        return ResponseEntity.ok(response);
    }
}