package com.prostor.prostorApp.modules.product.controller;

import com.prostor.prostorApp.modules.product.dto.ProductCardRequest;
import com.prostor.prostorApp.modules.product.dto.ProductCardResponse;
import com.prostor.prostorApp.modules.product.service.ProductCardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/products/{productId}/cards")
@RequiredArgsConstructor
public class ProductCardController {

    private final ProductCardService cardService;

    @GetMapping
    public ResponseEntity<List<ProductCardResponse>> getByProductId(@PathVariable Integer productId) {
        log.debug("Getting product cards for product id: {}", productId);
        return ResponseEntity.ok(cardService.getByProductId(productId));
    }

    @GetMapping("/{cardId}")
    public ResponseEntity<ProductCardResponse> getById(@PathVariable Integer cardId) {
        log.debug("Getting product card by id: {}", cardId);
        return ResponseEntity.ok(cardService.getById(cardId));
    }

    @PostMapping
    public ResponseEntity<ProductCardResponse> create(
            @PathVariable Integer productId,
            @Valid @RequestBody ProductCardRequest request) {

        log.info("Creating product card for product id: {}", productId);

        if (request.getProductId() == null) {
            throw new IllegalArgumentException("productId в теле запроса обязателен");
        }

        if (!productId.equals(request.getProductId())) {
            log.warn("Product ID mismatch: path={}, body={}", productId, request.getProductId());
            throw new IllegalArgumentException(
                    String.format("Product ID in path (%d) does not match product ID in request body (%d)",
                            productId, request.getProductId())
            );
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(cardService.create(request));
    }

    @PutMapping("/{cardId}")
    public ResponseEntity<ProductCardResponse> update(
            @PathVariable Integer cardId,
            @Valid @RequestBody ProductCardRequest request) {
        log.info("Updating product card: cardId={}, productId={}", cardId, request.getProductId());
        return ResponseEntity.ok(cardService.update(cardId, request));
    }

    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> delete(@PathVariable Integer cardId) {
        log.info("Deleting product card: cardId={}", cardId);
        cardService.delete(cardId);
        return ResponseEntity.noContent().build();
    }
}