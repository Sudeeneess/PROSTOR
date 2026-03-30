package com.prostor.prostorApp.modules.warehouse.controller;

import com.prostor.prostorApp.modules.warehouse.dto.WarehouseRequest;
import com.prostor.prostorApp.modules.warehouse.dto.WarehouseResponse;
import com.prostor.prostorApp.modules.warehouse.dto.WarehouseStockRequest;
import com.prostor.prostorApp.modules.warehouse.dto.WarehouseStockResponse;
import com.prostor.prostorApp.modules.warehouse.service.WarehouseService;
import com.prostor.prostorApp.modules.warehouse.service.WarehouseStockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseService warehouseService;
    private final WarehouseStockService warehouseStockService;

    // ==================== Управление складами ====================

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<Page<WarehouseResponse>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        log.info("Getting all warehouses");
        return ResponseEntity.ok(warehouseService.getAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<WarehouseResponse> getById(@PathVariable Integer id) {
        log.info("Getting warehouse by id: {}", id);
        return ResponseEntity.ok(warehouseService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WarehouseResponse> create(@Valid @RequestBody WarehouseRequest request) {
        log.info("Creating new warehouse with address: {}", request.getWarehouseAddress());
        return ResponseEntity.status(HttpStatus.CREATED).body(warehouseService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WarehouseResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody WarehouseRequest request) {
        log.info("Updating warehouse with id: {}", id);
        return ResponseEntity.ok(warehouseService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        log.info("Deleting warehouse with id: {}", id);
        warehouseService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Управление остатками на складе ====================

    @GetMapping("/stocks")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<List<WarehouseStockResponse>> getAllStocks(
            @RequestParam(required = false) Integer warehouseId,
            @RequestParam(required = false) Integer productId) {
        log.info("Getting stocks: warehouseId={}, productId={}", warehouseId, productId);
        return ResponseEntity.ok(warehouseStockService.getAll(warehouseId, productId));
    }

    @GetMapping("/stocks/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<WarehouseStockResponse> getStockById(@PathVariable Integer id) {
        log.info("Getting stock by id: {}", id);
        return ResponseEntity.ok(warehouseStockService.getById(id));
    }

    @PostMapping("/stocks")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WarehouseStockResponse> createStock(@Valid @RequestBody WarehouseStockRequest request) {
        log.info("Creating stock: warehouseId={}, productId={}", request.getWarehouseId(), request.getProductId());
        return ResponseEntity.status(HttpStatus.CREATED).body(warehouseStockService.create(request));
    }

    @PutMapping("/stocks/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WarehouseStockResponse> updateStock(
            @PathVariable Integer id,
            @Valid @RequestBody WarehouseStockRequest request) {
        log.info("Updating stock with id: {}", id);
        return ResponseEntity.ok(warehouseStockService.update(id, request));
    }

    @DeleteMapping("/stocks/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStock(@PathVariable Integer id) {
        log.info("Deleting stock with id: {}", id);
        warehouseStockService.delete(id);
        return ResponseEntity.noContent().build();
    }
}