package com.prostor.prostorApp.modules.warehouse.controller;

import com.prostor.prostorApp.modules.warehouse.dto.WarehouseStockRequest;
import com.prostor.prostorApp.modules.warehouse.dto.WarehouseStockResponse;
import com.prostor.prostorApp.modules.warehouse.service.WarehouseStockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/warehouse-stocks")
@RequiredArgsConstructor
public class WarehouseStockController {

    private final WarehouseStockService stockService;

    @GetMapping
    public ResponseEntity<List<WarehouseStockResponse>> getAll(
            @RequestParam(required = false) Integer warehouseId,
            @RequestParam(required = false) Integer productId) {
        return ResponseEntity.ok(stockService.getAll(warehouseId, productId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarehouseStockResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(stockService.getById(id));
    }

    @PostMapping
    public ResponseEntity<WarehouseStockResponse> create(@Valid @RequestBody WarehouseStockRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WarehouseStockResponse> update(@PathVariable Integer id, @Valid @RequestBody WarehouseStockRequest request) {
        return ResponseEntity.ok(stockService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        stockService.delete(id);
        return ResponseEntity.noContent().build();
    }
}