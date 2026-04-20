package com.prostor.prostorApp.modules.warehouse.controller;

import com.prostor.prostorApp.modules.user.model.User;
import com.prostor.prostorApp.modules.user.model.WarehouseManager;
import com.prostor.prostorApp.modules.user.repository.UserRepository;
import com.prostor.prostorApp.modules.user.repository.WarehouseManagerRepository;
import com.prostor.prostorApp.modules.warehouse.dto.GoodsReceptionDetailsResponse;
import com.prostor.prostorApp.modules.warehouse.dto.GoodsReceptionListResponse;
import com.prostor.prostorApp.modules.warehouse.model.ReceptionStatus;
import com.prostor.prostorApp.modules.warehouse.service.GoodsReceptionService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/warehouse/receptions")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
public class GoodsReceptionController {

    private final GoodsReceptionService goodsReceptionService;
    private final UserRepository userRepository;
    private final WarehouseManagerRepository warehouseManagerRepository;

    @GetMapping
    public ResponseEntity<List<GoodsReceptionListResponse>> getReceptions(
            @RequestParam(required = false) ReceptionStatus status,
            @RequestParam(required = false) Integer sellerId,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate
    ) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        return ResponseEntity.ok(goodsReceptionService.getForWarehouse(status, sellerId, fromDateTime, toDateTime));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoodsReceptionDetailsResponse> getReceptionById(@PathVariable Integer id) {
        return ResponseEntity.ok(goodsReceptionService.getDetails(id));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<GoodsReceptionDetailsResponse> acceptReception(
            @PathVariable Integer id,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal
    ) {
        User user = userRepository.findByUserName(principal.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("Пользователь не найден: " + principal.getUsername()));

        WarehouseManager warehouseManager = warehouseManagerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Менеджер склада не найден для пользователя: " + principal.getUsername()));

        log.info("Warehouse manager {} accepting reception {}", warehouseManager.getId(), id);
        return ResponseEntity.ok(goodsReceptionService.acceptReception(id, warehouseManager));
    }
}
