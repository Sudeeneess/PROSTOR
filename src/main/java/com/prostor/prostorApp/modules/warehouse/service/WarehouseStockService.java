package com.prostor.prostorApp.modules.warehouse.service;

import com.prostor.prostorApp.modules.product.model.Product;
import com.prostor.prostorApp.modules.product.repository.ProductRepository;
import com.prostor.prostorApp.modules.warehouse.dto.WarehouseStockRequest;
import com.prostor.prostorApp.modules.warehouse.dto.WarehouseStockResponse;
import com.prostor.prostorApp.modules.warehouse.model.Warehouse;
import com.prostor.prostorApp.modules.warehouse.model.WarehouseStock;
import com.prostor.prostorApp.modules.warehouse.repository.WarehouseRepository;
import com.prostor.prostorApp.modules.warehouse.repository.WarehouseStockRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WarehouseStockService {

    private final WarehouseStockRepository stockRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;

    private WarehouseStockResponse toResponse(WarehouseStock stock) {
        if (stock == null) return null;
        WarehouseStockResponse response = new WarehouseStockResponse();
        response.setId(stock.getId());
        response.setWarehouseId(stock.getWarehouse() != null ? stock.getWarehouse().getId() : null);
        response.setProductId(stock.getProduct() != null ? stock.getProduct().getId() : null);
        response.setProductName(stock.getProduct() != null ? stock.getProduct().getName() : null);
        response.setQuantity(stock.getQuantity());
        response.setReservedQuantity(stock.getReservedQuantity());
        response.setSoldQuantity(stock.getSoldQuantity());
        response.setUpdatedAt(stock.getUpdatedAt());
        return response;
    }

    private WarehouseStock toEntity(WarehouseStockRequest request) {
        if (request == null) return null;
        WarehouseStock stock = new WarehouseStock();
        stock.setQuantity(request.getQuantity());
        return stock;
    }

    private void updateEntity(WarehouseStock stock, WarehouseStockRequest request) {
        if (request == null) return;
        stock.setQuantity(request.getQuantity());
    }

    public List<WarehouseStockResponse> getAll(Integer warehouseId, Integer productId) {
        log.debug("Getting stocks: warehouseId={}, productId={}", warehouseId, productId);

        List<WarehouseStock> stocks;
        if (warehouseId != null && productId != null) {
            stocks = stockRepository.findByWarehouseIdAndProductId(warehouseId, productId)
                    .map(List::of).orElse(List.of());
        } else if (warehouseId != null) {
            stocks = stockRepository.findByWarehouseId(warehouseId);
        } else if (productId != null) {
            stocks = stockRepository.findByProductId(productId);
        } else {
            stocks = stockRepository.findAll();
        }
        return stocks.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public WarehouseStockResponse getById(Integer id) {
        log.debug("Getting stock by id: {}", id);
        return stockRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("WarehouseStock not found with id: " + id));
    }

    @Transactional
    public WarehouseStockResponse create(WarehouseStockRequest request) {
        log.info("Creating stock: warehouseId={}, productId={}", request.getWarehouseId(), request.getProductId());

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with id: " + request.getWarehouseId()));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + request.getProductId()));

        if (stockRepository.findByWarehouseIdAndProductId(request.getWarehouseId(), request.getProductId()).isPresent()) {
            throw new IllegalArgumentException("Stock entry already exists for this warehouse and product");
        }

        WarehouseStock stock = toEntity(request);
        stock.setWarehouse(warehouse);
        stock.setProduct(product);
        stock.setReservedQuantity(0);
        stock.setSoldQuantity(0);

        WarehouseStock saved = stockRepository.save(stock);
        log.info("Stock created successfully with id: {}", saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public WarehouseStockResponse update(Integer id, WarehouseStockRequest request) {
        log.info("Updating stock with id: {}", id);

        WarehouseStock existing = stockRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("WarehouseStock not found with id: " + id));

        if (!existing.getWarehouse().getId().equals(request.getWarehouseId())) {
            Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                    .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with id: " + request.getWarehouseId()));
            existing.setWarehouse(warehouse);
        }
        if (!existing.getProduct().getId().equals(request.getProductId())) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + request.getProductId()));
            existing.setProduct(product);
        }

        updateEntity(existing, request);
        WarehouseStock updated = stockRepository.save(existing);
        log.info("Stock updated successfully with id: {}", updated.getId());
        return toResponse(updated);
    }

    @Transactional
    public void delete(Integer id) {
        log.info("Deleting stock with id: {}", id);

        if (!stockRepository.existsById(id)) {
            throw new EntityNotFoundException("WarehouseStock not found with id: " + id);
        }
        stockRepository.deleteById(id);

        log.info("Stock deleted successfully with id: {}", id);
    }

    // ==================== МЕТОДЫ ДЛЯ РЕЗЕРВИРОВАНИЯ ====================

    /**
     * Получить общее количество товара на всех складах
     */
    public int getTotalAvailableQuantity(Integer productId) {
        Integer total = stockRepository.getTotalQuantityByProductId(productId);
        return total != null ? total : 0;
    }

    /**
     * Атомарное резервирование товара
     * @param productId ID товара
     * @param quantity количество для резервирования
     * @return true если резервирование успешно, false если недостаточно товара
     */
    @Transactional
    public boolean reserveProduct(Integer productId, int quantity) {
        log.debug("Reserving product: productId={}, quantity={}", productId, quantity);

        int updated = stockRepository.reserveProduct(productId, quantity);

        if (updated > 0) {
            log.debug("Successfully reserved {} units of product {}", quantity, productId);
            return true;
        } else {
            log.warn("Failed to reserve {} units of product {} - insufficient stock", quantity, productId);
            return false;
        }
    }

    /**
     * Атомарное освобождение товара (отмена резервирования)
     * @param productId ID товара
     * @param quantity количество для освобождения
     * @return true если освобождение успешно
     */
    @Transactional
    public boolean releaseProduct(Integer productId, int quantity) {
        log.debug("Releasing product: productId={}, quantity={}", productId, quantity);

        int updated = stockRepository.releaseProduct(productId, quantity);

        if (updated > 0) {
            log.debug("Successfully released {} units of product {}", quantity, productId);
            return true;
        } else {
            log.warn("Failed to release {} units of product {}", quantity, productId);
            return false;
        }
    }
}