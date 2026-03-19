package com.prostor.prostorApp.modules.order.controller;

import com.prostor.prostorApp.modules.order.dto.OrderRequest;
import com.prostor.prostorApp.modules.order.dto.OrderResponse;
import com.prostor.prostorApp.modules.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(orderService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.getById(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderResponse>> getByCustomer(@PathVariable Integer customerId) {
        return ResponseEntity.ok(orderService.getByCustomer(customerId));
    }

    @GetMapping("/status/{statusId}")
    public ResponseEntity<Page<OrderResponse>> getByStatus(@PathVariable Integer statusId, Pageable pageable) {
        return ResponseEntity.ok(orderService.getByStatus(statusId, pageable));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<OrderResponse> confirm(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.confirmOrder(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancel(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }

    @PutMapping("/{id}/status/{statusId}")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Integer id, @PathVariable Integer statusId) {
        return ResponseEntity.ok(orderService.updateStatus(id, statusId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}