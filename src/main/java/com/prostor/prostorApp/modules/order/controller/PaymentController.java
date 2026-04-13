package com.prostor.prostorApp.modules.order.controller;

import com.prostor.prostorApp.modules.order.dto.PaymentDto;
import com.prostor.prostorApp.modules.order.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/order-item/{orderItemId}")
    public ResponseEntity<List<PaymentDto>> getByOrderItem(@PathVariable Integer orderItemId) {
        return ResponseEntity.ok(paymentService.getByOrderItem(orderItemId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(paymentService.getById(id));
    }

    @PostMapping("/order-item/{orderItemId}")
    public ResponseEntity<PaymentDto> create(@PathVariable Integer orderItemId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createPayment(orderItemId));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<PaymentDto> confirm(@PathVariable Integer id) {
        return ResponseEntity.ok(paymentService.confirmPayment(id));
    }
}