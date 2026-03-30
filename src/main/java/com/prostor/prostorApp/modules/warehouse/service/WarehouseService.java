package com.prostor.prostorApp.modules.warehouse.service;

import com.prostor.prostorApp.modules.warehouse.dto.WarehouseRequest;
import com.prostor.prostorApp.modules.warehouse.dto.WarehouseResponse;
import com.prostor.prostorApp.modules.warehouse.model.Warehouse;
import com.prostor.prostorApp.modules.warehouse.repository.WarehouseRepository;
import com.prostor.prostorApp.modules.user.model.WarehouseManager;
import com.prostor.prostorApp.modules.user.repository.WarehouseManagerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseManagerRepository warehouseManagerRepository;

    private WarehouseResponse toResponse(Warehouse warehouse) {
        if (warehouse == null) return null;
        WarehouseResponse response = new WarehouseResponse();
        response.setId(warehouse.getId());
        response.setWarehouseAddress(warehouse.getWarehouseAddress());
        response.setWarehouseManagerId(warehouse.getWarehouseManager() != null ? warehouse.getWarehouseManager().getId() : null);
        return response;
    }

    private Warehouse toEntity(WarehouseRequest request) {
        if (request == null) return null;
        Warehouse warehouse = new Warehouse();
        warehouse.setWarehouseAddress(request.getWarehouseAddress());
        return warehouse;
    }

    private void updateEntity(Warehouse warehouse, WarehouseRequest request) {
        if (request == null) return;
        warehouse.setWarehouseAddress(request.getWarehouseAddress());
    }

    public Page<WarehouseResponse> getAll(Pageable pageable) {
        log.debug("Getting all warehouses with pagination");
        return warehouseRepository.findAll(pageable).map(this::toResponse);
    }

    public WarehouseResponse getById(Integer id) {
        log.debug("Getting warehouse by id: {}", id);
        return warehouseRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with id: " + id));
    }

    @Transactional
    public WarehouseResponse create(WarehouseRequest request) {
        log.info("Creating new warehouse with address: {}", request.getWarehouseAddress());

        WarehouseManager manager = warehouseManagerRepository.findById(request.getWarehouseManagerId())
                .orElseThrow(() -> new EntityNotFoundException("WarehouseManager not found with id: " + request.getWarehouseManagerId()));

        Warehouse warehouse = toEntity(request);
        warehouse.setWarehouseManager(manager);

        Warehouse saved = warehouseRepository.save(warehouse);
        log.info("Warehouse created successfully with id: {}", saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public WarehouseResponse update(Integer id, WarehouseRequest request) {
        log.info("Updating warehouse with id: {}", id);

        Warehouse existing = warehouseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with id: " + id));

        if (!existing.getWarehouseManager().getId().equals(request.getWarehouseManagerId())) {
            WarehouseManager manager = warehouseManagerRepository.findById(request.getWarehouseManagerId())
                    .orElseThrow(() -> new EntityNotFoundException("WarehouseManager not found with id: " + request.getWarehouseManagerId()));
            existing.setWarehouseManager(manager);
        }

        updateEntity(existing, request);
        Warehouse updated = warehouseRepository.save(existing);
        log.info("Warehouse updated successfully with id: {}", updated.getId());
        return toResponse(updated);
    }

    @Transactional
    public void delete(Integer id) {
        log.info("Deleting warehouse with id: {}", id);

        if (!warehouseRepository.existsById(id)) {
            throw new EntityNotFoundException("Warehouse not found with id: " + id);
        }
        warehouseRepository.deleteById(id);

        log.info("Warehouse deleted successfully with id: {}", id);
    }
}