package com.prostor.prostorApp.modules.product.service;

import com.prostor.prostorApp.modules.product.dto.ProductRequest;
import com.prostor.prostorApp.modules.product.dto.ProductResponse;
import com.prostor.prostorApp.modules.product.model.Category;
import com.prostor.prostorApp.modules.product.model.Product;
import com.prostor.prostorApp.modules.product.repository.CategoryRepository;
import com.prostor.prostorApp.modules.product.repository.ProductRepository;
import com.prostor.prostorApp.modules.user.model.Seller;
import com.prostor.prostorApp.modules.user.repository.SellerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;
    private final CategoryRepository categoryRepository;

    // Преобразование Product -> ProductResponse
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

    // Создание Product из ProductRequest (без связей)
    private Product toEntity(ProductRequest request) {
        if (request == null) return null;
        Product product = new Product();
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        return product;
    }

    public Page<ProductResponse> getAll(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::toResponse);
    }

    public Page<ProductResponse> filter(Integer categoryId, Integer sellerId,
                                        double minPrice, double maxPrice,
                                        String name, Pageable pageable) {
        if (name != null && !name.isEmpty()) {
            return productRepository.findByNameContainingIgnoreCase(name, pageable)
                    .map(this::toResponse);
        }
        return productRepository.filterProducts(categoryId, sellerId, minPrice, maxPrice, pageable)
                .map(this::toResponse);
    }

    public ProductResponse getById(Integer id) {
        return productRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Seller seller = sellerRepository.findById(request.getSellerId())
                .orElseThrow(() -> new EntityNotFoundException("Seller not found with id: " + request.getSellerId()));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + request.getCategoryId()));

        if (productRepository.existsByNameAndSellerId(request.getName(), request.getSellerId())) {
            throw new IllegalArgumentException("Product with this name already exists for this seller");
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
        return toResponse(saved);
    }

    @Transactional
    public ProductResponse update(Integer id, ProductRequest request) {
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

        existing.setName(request.getName());
        existing.setPrice(request.getPrice());

        if (!existing.getName().equals(request.getName()) &&
                productRepository.existsByNameAndSellerId(request.getName(), existing.getSeller().getId())) {
            throw new IllegalArgumentException("Product with this name already exists for this seller");
        }

        Product updated = productRepository.save(existing);
        return toResponse(updated);
    }

    @Transactional
    public void delete(Integer id) {
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }
}