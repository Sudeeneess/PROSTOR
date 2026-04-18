package com.prostor.prostorApp.modules.order.service;

import com.prostor.prostorApp.modules.order.dto.OrderStatusDto;
import com.prostor.prostorApp.modules.order.model.OrdersStatus;
import com.prostor.prostorApp.modules.order.repository.OrdersStatusRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrdersStatusService {

    private final OrdersStatusRepository repository;

    private OrderStatusDto toDto(OrdersStatus status) {
        if (status == null) return null;
        OrderStatusDto dto = new OrderStatusDto();
        dto.setId(status.getId());
        dto.setName(status.getName());
        return dto;
    }

    private OrdersStatus toEntity(OrderStatusDto dto) {
        if (dto == null) return null;
        OrdersStatus status = new OrdersStatus();
        status.setName(dto.getName());
        return status;
    }

    private void updateEntity(OrdersStatus status, OrderStatusDto dto) {
        if (dto == null) return;
        status.setName(dto.getName());
    }

    public Page<OrderStatusDto> getAll(Pageable pageable) {
        return repository.findAll(pageable).map(this::toDto);
    }

    public OrderStatusDto getById(Integer id) {
        return repository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Статус заказа с идентификатором не найден: " + id));
    }

    public OrderStatusDto getByName(String name) {
        return repository.findByName(name)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Статус заказа по имени не найден: " + name));
    }

    @Transactional
    public OrderStatusDto create(OrderStatusDto dto) {
        if (repository.findByName(dto.getName()).isPresent()) {
            throw new IllegalArgumentException("Статус с таким названием уже существует");
        }
        OrdersStatus status = toEntity(dto);
        OrdersStatus saved = repository.save(status);
        return toDto(saved);
    }

    @Transactional
    public OrderStatusDto update(Integer id, OrderStatusDto dto) {
        OrdersStatus existing = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Статус заказа с идентификатором не найден: " + id));
        updateEntity(existing, dto);
        OrdersStatus updated = repository.save(existing);
        return toDto(updated);
    }

    @Transactional
    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Статус заказа с идентификатором не найден: " + id);
        }
        repository.deleteById(id);
    }
}