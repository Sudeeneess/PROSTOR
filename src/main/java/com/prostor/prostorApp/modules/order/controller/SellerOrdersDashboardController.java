package com.prostor.prostorApp.modules.order.controller;

import com.prostor.prostorApp.modules.order.dto.SellerOrdersDashboardResponse;
import com.prostor.prostorApp.modules.order.service.SellerOrdersDashboardService;
import com.prostor.prostorApp.modules.user.model.Seller;
import com.prostor.prostorApp.modules.user.repository.SellerRepository;
import com.prostor.prostorApp.modules.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/seller/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
public class SellerOrdersDashboardController {

    private final SellerOrdersDashboardService sellerOrdersDashboardService;
    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<SellerOrdersDashboardResponse> getSellerOrdersDashboard(
            @AuthenticationPrincipal User principal) {
        Integer sellerId = getSellerIdByUsername(principal.getUsername());
        return ResponseEntity.ok(sellerOrdersDashboardService.getDashboard(sellerId));
    }

    private Integer getSellerIdByUsername(String username) {
        com.prostor.prostorApp.modules.user.model.User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));

        Seller seller = sellerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Seller not found for user: " + username));

        return seller.getId();
    }
}
