package com.prostor.prostorApp.modules.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/warehouse")
public class WarehouseManagerController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('WAREHOUSE_MANAGER')")
    public ResponseEntity<Map<String, String>> getWarehouseDashboard(
            @AuthenticationPrincipal User principal) {

        Map<String, String> response = new HashMap<>();
        response.put("role", "WAREHOUSE_MANAGER");
        response.put("username", principal.getUsername());
        response.put("message", "Добро пожаловать в панель управления складом");
        response.put("status", "ready");
        response.put("redirect", "/warehouse/dashboard");

        return ResponseEntity.ok(response);
    }
}