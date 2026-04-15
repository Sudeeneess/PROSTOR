package com.prostor.prostorApp.modules.user.controller;

import com.prostor.prostorApp.modules.product.dto.ProductRequest;
import com.prostor.prostorApp.modules.product.dto.ProductResponse;
import com.prostor.prostorApp.modules.product.service.ProductService;
import com.prostor.prostorApp.modules.user.dto.SellerProductCreateRequest;
import com.prostor.prostorApp.modules.user.dto.SellerProductResponse;
import com.prostor.prostorApp.modules.user.model.Seller;
import com.prostor.prostorApp.modules.user.repository.SellerRepository;
import com.prostor.prostorApp.modules.user.repository.UserRepository;
import com.prostor.prostorApp.modules.warehouse.service.WarehouseStockService;
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
    private final WarehouseStockService warehouseStockService;

    private Integer getSellerIdByUsername(String username) {
        com.prostor.prostorApp.modules.user.model.User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));

        Seller seller = sellerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Seller not found for user: " + username));

        return seller.getId();
    }

    private SellerProductResponse toSellerResponse(ProductResponse product) {
        SellerProductResponse response = new SellerProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setPrice(product.getPrice());
        response.setSellerId(product.getSellerId());
        response.setCategoryId(product.getCategoryId());
        response.setParentId(product.getParentId());
        response.setCreatedAt(product.getCreatedAt());
        response.setAvailableQuantity(warehouseStockService.getTotalAvailableQuantity(product.getId()));
        return response;
    }

    private ProductRequest toProductRequest(SellerProductCreateRequest request, Integer sellerId) {
        ProductRequest productRequest = new ProductRequest();
        productRequest.setName(request.getName());
        productRequest.setPrice(request.getPrice());
        productRequest.setSellerId(sellerId);
        productRequest.setCategoryId(request.getCategoryId());
        productRequest.setParentId(request.getParentId());
        return productRequest;
    }

    @GetMapping
    public ResponseEntity<Page<SellerProductResponse>> getMyProducts(
            @AuthenticationPrincipal User principal,
            @PageableDefault(size = 20) Pageable pageable) {

        Integer sellerId = getSellerIdByUsername(principal.getUsername());
        log.info("Seller {} getting their products", sellerId);

        Page<SellerProductResponse> response = productService.getProductsBySeller(sellerId, pageable)
                .map(this::toSellerResponse);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SellerProductResponse> getProductById(
            @AuthenticationPrincipal User principal,
            @PathVariable Integer id) {

        Integer sellerId = getSellerIdByUsername(principal.getUsername());
        log.info("Seller {} getting product by id: {}", sellerId, id);

        ProductResponse product = productService.getById(id);

        if (!product.getSellerId().equals(sellerId)) {
            throw new SecurityException("You don't have permission to view this product");
        }

        return ResponseEntity.ok(toSellerResponse(product));
    }

    @PostMapping
    public ResponseEntity<SellerProductResponse> createProduct(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody SellerProductCreateRequest request) {

        Integer sellerId = getSellerIdByUsername(principal.getUsername());
        log.info("Seller {} creating new product: {}", sellerId, request.getName());

        ProductRequest productRequest = toProductRequest(request, sellerId);
        ProductResponse created = productService.createForSellerWithInitialStock(
                productRequest,
                request.getWarehouseId(),
                request.getInitialQuantity()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(toSellerResponse(created));
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