package com.prostor.prostorApp.modules.order.controller;

import com.prostor.prostorApp.modules.order.dto.OrderStatusDto;
import com.prostor.prostorApp.modules.order.service.OrdersStatusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders-statuses")
@RequiredArgsConstructor
public class OrdersStatusController {

    private final OrdersStatusService service;

    @GetMapping
    public ResponseEntity<Page<OrderStatusDto>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(service.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderStatusDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<OrderStatusDto> create(@Valid @RequestBody OrderStatusDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderStatusDto> update(@PathVariable Integer id, @Valid @RequestBody OrderStatusDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}