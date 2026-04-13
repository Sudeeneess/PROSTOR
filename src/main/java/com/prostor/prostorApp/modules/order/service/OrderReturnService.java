package com.prostor.prostorApp.modules.order.service;

import com.prostor.prostorApp.modules.order.dto.OrderReturnDto;
import com.prostor.prostorApp.modules.order.model.OrderItem;
import com.prostor.prostorApp.modules.order.model.OrderReturn;
import com.prostor.prostorApp.modules.order.model.OrderReturnsStatus;
import com.prostor.prostorApp.modules.order.repository.OrderItemRepository;
import com.prostor.prostorApp.modules.order.repository.OrderReturnRepository;
import com.prostor.prostorApp.modules.order.repository.OrderReturnsStatusRepository;
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
public class OrderReturnService {

    private final OrderReturnRepository returnRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderReturnsStatusRepository statusRepository;

    private OrderReturnDto toDto(OrderReturn orderReturn) {
        if (orderReturn == null) return null;
        OrderReturnDto dto = new OrderReturnDto();
        dto.setId(orderReturn.getId());
        dto.setStatus(orderReturn.getOrderReturnsStatus().getName());
        dto.setReturnReason(orderReturn.getReturnReason());
        dto.setCreatedAt(orderReturn.getCreatedAt());
        return dto;
    }

    public List<OrderReturnDto> getAll() {
        return returnRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public OrderReturnDto getById(Integer id) {
        return returnRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Возврат заказа с идентификатором не найден: " + id));
    }

    @Transactional
    public OrderReturnDto createReturn(Integer orderItemId, String reason) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new EntityNotFoundException("Товар заказа не найден с идентификатором: " + orderItemId));

        if (item.getOrderReturn() != null) {
            throw new IllegalStateException("Возврат уже существует для этого элемента заказа");
        }

        OrderReturnsStatus status = statusRepository.findByName("ЗАПРОШЕННЫЙ")
                .orElseThrow(() -> new EntityNotFoundException("ЗАПРОШЕННЫЙ статус возврата не найден"));

        OrderReturn orderReturn = new OrderReturn();
        orderReturn.setOrderReturnsStatus(status);
        orderReturn.setReturnReason(reason);
        orderReturn.setCreatedAt(LocalDateTime.now());

        OrderReturn saved = returnRepository.save(orderReturn);
        item.setOrderReturn(saved);
        orderItemRepository.save(item);

        return toDto(saved);
    }

    @Transactional
    public OrderReturnDto updateStatus(Integer returnId, String statusName) {
        OrderReturn orderReturn = returnRepository.findById(returnId)
                .orElseThrow(() -> new EntityNotFoundException("Возврат заказа с идентификатором не найден: " + returnId));
        OrderReturnsStatus newStatus = statusRepository.findByName(statusName)
                .orElseThrow(() -> new EntityNotFoundException("Статус возврата не найден: " + statusName));
        orderReturn.setOrderReturnsStatus(newStatus);
        OrderReturn updated = returnRepository.save(orderReturn);
        return toDto(updated);
    }
}
