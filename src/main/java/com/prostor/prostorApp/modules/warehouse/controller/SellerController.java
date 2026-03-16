package com.prostor.prostorApp.modules.warehouse.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
public class SellerController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Map<String, String>> getSellerDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, String> response = new HashMap<>();
        response.put("role", "SELLER");
        response.put("username", userDetails.getUsername());
        response.put("message", "Добро пожаловать в панель продавца");
        response.put("status", "ready");
        response.put("redirect", "/seller/dashboard");

        return ResponseEntity.ok(response);
    }
}
