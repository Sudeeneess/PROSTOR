package com.prostor.prostorApp.modules.product.controller;

import com.prostor.prostorApp.modules.product.dto.ProductCardRequest;
import com.prostor.prostorApp.modules.product.dto.ProductCardResponse;
import com.prostor.prostorApp.modules.product.service.ProductCardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/cards")
@RequiredArgsConstructor
public class ProductCardController {
    private final ProductCardService cardService;

    @GetMapping
    public ResponseEntity<List<ProductCardResponse>> getByProductId(@PathVariable Integer productId) {
        return ResponseEntity.ok(cardService.getByProductId(productId));
    }

    @GetMapping("/{cardId}")
    public ResponseEntity<ProductCardResponse> getById(@PathVariable Integer cardId) {
        return ResponseEntity.ok(cardService.getById(cardId));
    }

    @PostMapping
    public ResponseEntity<ProductCardResponse> create(
            @PathVariable Integer productId,
            @Valid @RequestBody ProductCardRequest request) {
        request.setProductId(productId); // если есть сеттер
        return ResponseEntity.status(HttpStatus.CREATED).body(cardService.create(request));
    }

    @PutMapping("/{cardId}")
    public ResponseEntity<ProductCardResponse> update(
            @PathVariable Integer cardId,
            @Valid @RequestBody ProductCardRequest request) {
        return ResponseEntity.ok(cardService.update(cardId, request));
    }

    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> delete(@PathVariable Integer cardId) {
        cardService.delete(cardId);
        return ResponseEntity.noContent().build();
    }
}
