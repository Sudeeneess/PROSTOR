package com.prostor.prostorApp.modules.order.service;

import com.prostor.prostorApp.modules.order.dto.OrderMovementDto;
import com.prostor.prostorApp.modules.order.model.MovementsStatus;
import com.prostor.prostorApp.modules.order.model.OrderItem;
import com.prostor.prostorApp.modules.order.model.OrderMovement;
import com.prostor.prostorApp.modules.order.repository.MovementsStatusRepository;
import com.prostor.prostorApp.modules.order.repository.OrderItemRepository;
import com.prostor.prostorApp.modules.order.repository.OrderMovementRepository;
import com.prostor.prostorApp.modules.warehouse.model.Warehouse;
import com.prostor.prostorApp.modules.warehouse.repository.WarehouseRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderMovementService {

    private final OrderMovementRepository movementRepository;
    private final OrderItemRepository orderItemRepository;
    private final WarehouseRepository warehouseRepository;
    private final MovementsStatusRepository statusRepository;

    private OrderMovementDto toDto(OrderMovement movement) {
        if (movement == null) return null;
        OrderMovementDto dto = new OrderMovementDto();
        dto.setId(movement.getId());
        dto.setWarehouseId(movement.getWarehouse().getId());
        dto.setOrderItemId(movement.getOrderItem().getId());
        dto.setStatus(movement.getMovementsStatus().getName());
        dto.setCreatedAt(movement.getCreatedAt());
        return dto;
    }

    public List<OrderMovementDto> getByOrderItem(Integer orderItemId) {
        return movementRepository.findByOrderItemId(orderItemId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public OrderMovementDto getById(Integer id) {
        return movementRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("OrderMovement не найден с идентификатором: " + id));
    }

    @Transactional
    public OrderMovementDto createMovement(Integer orderItemId, Integer warehouseId, String statusName) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new EntityNotFoundException("OrderItem не найден с идентификатором: " + orderItemId));
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new EntityNotFoundException("Склад с идентификатором не найден: " + warehouseId));
        MovementsStatus status = statusRepository.findByName(statusName)
                .orElseThrow(() -> new EntityNotFoundException("Статус перемещения не найден: " + statusName));

        OrderMovement movement = new OrderMovement();
        movement.setOrderItem(item);
        movement.setWarehouse(warehouse);
        movement.setMovementsStatus(status);
        movement.setCreatedAt(LocalDateTime.now());

        OrderMovement saved = movementRepository.save(movement);
        return toDto(saved);
    }

    @Transactional
    public OrderMovementDto updateStatus(Integer movementId, String statusName) {
        OrderMovement movement = movementRepository.findById(movementId)
                .orElseThrow(() -> new EntityNotFoundException("Перемещение заказа не найдено по идентификатору: " + movementId));
        MovementsStatus newStatus = statusRepository.findByName(statusName)
                .orElseThrow(() -> new EntityNotFoundException("Статус перемещения не найден: " + statusName));
        movement.setMovementsStatus(newStatus);
        OrderMovement updated = movementRepository.save(movement);
        return toDto(updated);
    }
}