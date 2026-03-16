package com.prostor.prostorApp.modules.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> getAdminDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, String> response = new HashMap<>();
        response.put("role", "ADMIN");
        response.put("username", userDetails.getUsername());
        response.put("message", "Добро пожаловать в панель администратора");
        response.put("status", "ready");
        response.put("redirect", "/admin/dashboard");

        return ResponseEntity.ok(response);
    }
}