package com.prostor.prostorApp.modules.product.service;

import com.prostor.prostorApp.modules.product.dto.ProductRequest;
import com.prostor.prostorApp.modules.product.dto.ProductResponse;
import com.prostor.prostorApp.modules.product.model.Category;
import com.prostor.prostorApp.modules.product.model.Product;
import com.prostor.prostorApp.modules.product.repository.CategoryRepository;
import com.prostor.prostorApp.modules.product.repository.ProductCardRepository;
import com.prostor.prostorApp.modules.product.repository.ProductRepository;
import com.prostor.prostorApp.modules.order.repository.OrderItemRepository;
import com.prostor.prostorApp.modules.user.model.Seller;
import com.prostor.prostorApp.modules.user.repository.SellerRepository;
import com.prostor.prostorApp.modules.warehouse.repository.WarehouseStockRepository;
import com.prostor.prostorApp.modules.warehouse.dto.WarehouseStockRequest;
import com.prostor.prostorApp.modules.warehouse.service.WarehouseStockService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;
    private final CategoryRepository categoryRepository;
    private final WarehouseStockService warehouseStockService;
    private final ProductCardRepository productCardRepository;
    private final WarehouseStockRepository warehouseStockRepository;
    private final OrderItemRepository orderItemRepository;

    private ProductResponse toResponse(Product product) {
        if (product == null) return null;
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setPrice(product.getPrice());
        response.setSellerId(product.getSeller() != null ? product.getSeller().getId() : null);
        response.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        response.setParentId(product.getParent() != null ? product.getParent().getId() : null);
        response.setCreatedAt(product.getCreatedAt());
        return response;
    }

    private Product toEntity(ProductRequest request) {
        if (request == null) return null;
        Product product = new Product();
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setCreatedAt(LocalDateTime.now());
        return product;
    }

    private void updateEntity(Product product, ProductRequest request) {
        if (request == null) return;
        product.setName(request.getName());
        product.setPrice(request.getPrice());
    }

    public Page<ProductResponse> getAll(Pageable pageable) {
        log.debug("Getting all products with pagination");
        return productRepository.findAll(pageable).map(this::toResponse);
    }

    public Page<ProductResponse> getProductsBySeller(Integer sellerId, Pageable pageable) {
        log.debug("Getting products by seller id: {}", sellerId);
        return productRepository.findBySellerId(sellerId, pageable)
                .map(this::toResponse);
    }

    public Page<ProductResponse> filter(Integer categoryId, Integer sellerId,
                                        Double minPrice, Double maxPrice,
                                        String name, Pageable pageable) {
        log.debug("Filtering products: categoryId={}, sellerId={}, minPrice={}, maxPrice={}, name={}",
                categoryId, sellerId, minPrice, maxPrice, name);

        Double min = (minPrice != null && minPrice > 0) ? minPrice : null;
        Double max = (maxPrice != null && maxPrice > 0) ? maxPrice : null;
        String searchName = (name != null && !name.trim().isEmpty()) ? name.trim() : null;

        return productRepository.filterProducts(categoryId, sellerId, min, max, searchName, pageable)
                .map(this::toResponse);
    }

    public ProductResponse getById(Integer id) {
        log.debug("Getting product by id: {}", id);
        return productRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        log.info("Creating new product: {}", request.getName());

        Seller seller = sellerRepository.findById(request.getSellerId())
                .orElseThrow(() -> new EntityNotFoundException("Seller not found with id: " + request.getSellerId()));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + request.getCategoryId()));

        if (productRepository.existsByNameAndSellerId(request.getName(), request.getSellerId())) {
            throw new IllegalArgumentException("Product with name '" + request.getName() +
                    "' already exists for this seller");
        }

        Product product = toEntity(request);
        product.setSeller(seller);
        product.setCategory(category);

        if (request.getParentId() != null) {
            Product parent = productRepository.findById(request.getParentId())
                    .orElseThrow(() -> new EntityNotFoundException("Parent product not found with id: " + request.getParentId()));
            product.setParent(parent);
        }

        Product saved = productRepository.save(product);
        log.info("Product created successfully with id: {}", saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public ProductResponse createForSellerWithInitialStock(ProductRequest request, Integer warehouseId, Integer initialQuantity) {
        ProductResponse createdProduct = create(request);

        WarehouseStockRequest stockRequest = new WarehouseStockRequest();
        stockRequest.setWarehouseId(warehouseId);
        stockRequest.setProductId(createdProduct.getId());
        stockRequest.setQuantity(initialQuantity);

        warehouseStockService.create(stockRequest);
        return createdProduct;
    }

    @Transactional
    public ProductResponse update(Integer id, ProductRequest request) {
        log.info("Updating product with id: {}", id);

        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));

        if (!existing.getSeller().getId().equals(request.getSellerId())) {
            Seller seller = sellerRepository.findById(request.getSellerId())
                    .orElseThrow(() -> new EntityNotFoundException("Seller not found with id: " + request.getSellerId()));
            existing.setSeller(seller);
        }

        if (!existing.getCategory().getId().equals(request.getCategoryId())) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + request.getCategoryId()));
            existing.setCategory(category);
        }

        if (request.getParentId() != null) {
            if (existing.getParent() == null || !existing.getParent().getId().equals(request.getParentId())) {
                Product parent = productRepository.findById(request.getParentId())
                        .orElseThrow(() -> new EntityNotFoundException("Parent product not found with id: " + request.getParentId()));
                existing.setParent(parent);
            }
        } else {
            existing.setParent(null);
        }

        if (!existing.getName().equals(request.getName()) &&
                productRepository.existsByNameAndSellerId(request.getName(), existing.getSeller().getId())) {
            throw new IllegalArgumentException("Product with name '" + request.getName() +
                    "' already exists for this seller");
        }

        existing.setName(request.getName());
        existing.setPrice(request.getPrice());

        Product updated = productRepository.save(existing);
        log.info("Product updated successfully with id: {}", updated.getId());
        return toResponse(updated);
    }

    @Transactional
    public void delete(Integer id) {
        log.info("Deleting product with id: {}", id);

        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Product not found with id: " + id);
        }

        if (orderItemRepository.existsByProductId(id)) {
            throw new IllegalStateException("Товар участвует в заказах и не может быть удален");
        }

        productCardRepository.deleteByProductId(id);
        warehouseStockRepository.deleteByProductId(id);

        productRepository.deleteById(id);

        log.info("Product deleted successfully with id: {}", id);
    }
}