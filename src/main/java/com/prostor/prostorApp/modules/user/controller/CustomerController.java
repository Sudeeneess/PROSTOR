package com.prostor.prostorApp.modules.user.controller;


import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, String>> getCustomerDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, String> response = new HashMap<>();
        response.put("role", "CUSTOMER");
        response.put("username", userDetails.getUsername());
        response.put("message", "Добро пожаловать в личный кабинет покупателя");
        response.put("status", "ready");
        response.put("redirect", "/customer/dashboard");

        return ResponseEntity.ok(response);
    }
}