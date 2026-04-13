package com.prostor.prostorApp.modules.order.controller;

import com.prostor.prostorApp.modules.order.dto.OrderReturnDto;
import com.prostor.prostorApp.modules.order.service.OrderReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-returns")
@RequiredArgsConstructor
public class OrderReturnController {

    private final OrderReturnService returnService;

    @GetMapping
    public ResponseEntity<List<OrderReturnDto>> getAll() {
        return ResponseEntity.ok(returnService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderReturnDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(returnService.getById(id));
    }

    @PostMapping("/order-item/{orderItemId}")
    public ResponseEntity<OrderReturnDto> createReturn(@PathVariable Integer orderItemId, @RequestBody String reason) {
        return ResponseEntity.status(HttpStatus.CREATED).body(returnService.createReturn(orderItemId, reason));
    }

    @PutMapping("/{id}/status/{statusName}")
    public ResponseEntity<OrderReturnDto> updateStatus(@PathVariable Integer id, @PathVariable String statusName) {
        return ResponseEntity.ok(returnService.updateStatus(id, statusName));
    }
}