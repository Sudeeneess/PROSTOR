package com.prostor.prostorApp.modules.order.controller;

import com.prostor.prostorApp.modules.order.dto.OrderMovementDto;
import com.prostor.prostorApp.modules.order.service.OrderMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-movements")
@RequiredArgsConstructor
public class OrderMovementController {

    private final OrderMovementService movementService;

    @GetMapping("/order-item/{orderItemId}")
    public ResponseEntity<List<OrderMovementDto>> getByOrderItem(@PathVariable Integer orderItemId) {
        return ResponseEntity.ok(movementService.getByOrderItem(orderItemId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderMovementDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(movementService.getById(id));
    }

    @PostMapping
    public ResponseEntity<OrderMovementDto> create(@RequestParam Integer orderItemId,
                                                   @RequestParam Integer warehouseId,
                                                   @RequestParam String statusName) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(movementService.createMovement(orderItemId, warehouseId, statusName));
    }

    @PutMapping("/{id}/status/{statusName}")
    public ResponseEntity<OrderMovementDto> updateStatus(@PathVariable Integer id, @PathVariable String statusName) {
        return ResponseEntity.ok(movementService.updateStatus(id, statusName));
    }
}
