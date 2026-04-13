package com.prostor.prostorApp.modules.order.controller;

import com.prostor.prostorApp.modules.order.dto.OrderRequest;
import com.prostor.prostorApp.modules.order.dto.OrderResponse;
import com.prostor.prostorApp.modules.order.service.OrderService;
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
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<Page<OrderResponse>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        log.debug("GET /api/orders - getting all orders");
        return ResponseEntity.ok(orderService.getAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @orderSecurity.isCustomerOwner(#id, authentication)")
    public ResponseEntity<OrderResponse> getById(@PathVariable Integer id) {
        log.debug("GET /api/orders/{}", id);
        return ResponseEntity.ok(orderService.getById(id));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasRole('ADMIN') or #customerId == authentication.principal.id")
    public ResponseEntity<List<OrderResponse>> getByCustomer(@PathVariable Integer customerId) {
        log.debug("GET /api/orders/customer/{}", customerId);
        return ResponseEntity.ok(orderService.getByCustomer(customerId));
    }

    @GetMapping("/status/{statusId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<Page<OrderResponse>> getByStatus(@PathVariable Integer statusId,
                                                           @PageableDefault(size = 20) Pageable pageable) {
        log.debug("GET /api/orders/status/{}", statusId);
        return ResponseEntity.ok(orderService.getByStatus(statusId, pageable));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody OrderRequest request) {
        log.info("POST /api/orders - creating order for customer: {}", request.getCustomerId());
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<OrderResponse> confirm(@PathVariable Integer id) {
        log.info("PUT /api/orders/{}/confirm", id);
        return ResponseEntity.ok(orderService.confirmOrder(id));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN') or @orderSecurity.isCustomerOwner(#id, authentication)")
    public ResponseEntity<OrderResponse> cancel(@PathVariable Integer id) {
        log.info("PUT /api/orders/{}/cancel", id);
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }

    @PutMapping("/{id}/status/{statusId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Integer id,
                                                      @PathVariable Integer statusId) {
        log.info("PUT /api/orders/{}/status/{}", id, statusId);
        return ResponseEntity.ok(orderService.updateStatus(id, statusId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        log.info("DELETE /api/orders/{}", id);
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}