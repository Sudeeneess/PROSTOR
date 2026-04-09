package com.prostor.prostorApp.modules.user.controller;

import com.prostor.prostorApp.modules.product.dto.ProductRequest;
import com.prostor.prostorApp.modules.product.dto.ProductResponse;
import com.prostor.prostorApp.modules.product.service.ProductService;
import com.prostor.prostorApp.modules.user.model.Seller;
import com.prostor.prostorApp.modules.user.repository.SellerRepository;
import com.prostor.prostorApp.modules.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/seller/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
public class SellerController {

    private final ProductService productService;
    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;

    private Integer getSellerIdByUsername(String username) {
        com.prostor.prostorApp.modules.user.model.User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));

        Seller seller = sellerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Seller not found for user: " + username));

        return seller.getId();
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getMyProducts(
            @AuthenticationPrincipal User principal,
            @PageableDefault(size = 20) Pageable pageable) {

        Integer sellerId = getSellerIdByUsername(principal.getUsername());
        log.info("Seller {} getting their products", sellerId);

        return ResponseEntity.ok(productService.getProductsBySeller(sellerId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(
            @AuthenticationPrincipal User principal,
            @PathVariable Integer id) {

        Integer sellerId = getSellerIdByUsername(principal.getUsername());
        log.info("Seller {} getting product by id: {}", sellerId, id);

        ProductResponse product = productService.getById(id);

        if (!product.getSellerId().equals(sellerId)) {
            throw new SecurityException("You don't have permission to view this product");
        }

        return ResponseEntity.ok(product);
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody ProductRequest request) {

        Integer sellerId = getSellerIdByUsername(principal.getUsername());
        log.info("Seller {} creating new product: {}", sellerId, request.getName());

        request.setSellerId(sellerId);

        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @AuthenticationPrincipal User principal,
            @PathVariable Integer id,
            @Valid @RequestBody ProductRequest request) {

        Integer sellerId = getSellerIdByUsername(principal.getUsername());
        log.info("Seller {} updating product with id: {}", sellerId, id);

        ProductResponse existing = productService.getById(id);
        if (!existing.getSellerId().equals(sellerId)) {
            throw new SecurityException("You don't have permission to update this product");
        }

        request.setSellerId(sellerId);
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @AuthenticationPrincipal User principal,
            @PathVariable Integer id) {

        Integer sellerId = getSellerIdByUsername(principal.getUsername());
        log.info("Seller {} deleting product with id: {}", sellerId, id);

        ProductResponse existing = productService.getById(id);
        if (!existing.getSellerId().equals(sellerId)) {
            throw new SecurityException("You don't have permission to delete this product");
        }

        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}