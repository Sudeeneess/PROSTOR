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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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
        return stockRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("WarehouseStock not found with id: " + id));
    }

    @Transactional
    public WarehouseStockResponse create(WarehouseStockRequest request) {
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

        WarehouseStock saved = stockRepository.save(stock);
        return toResponse(saved);
    }

    @Transactional
    public WarehouseStockResponse update(Integer id, WarehouseStockRequest request) {
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
        return toResponse(updated);
    }

    @Transactional
    public void delete(Integer id) {
        if (!stockRepository.existsById(id)) {
            throw new EntityNotFoundException("WarehouseStock not found with id: " + id);
        }
        stockRepository.deleteById(id);
    }
}