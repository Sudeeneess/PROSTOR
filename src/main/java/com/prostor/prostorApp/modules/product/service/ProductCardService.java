package com.prostor.prostorApp.modules.product.service;

import com.prostor.prostorApp.modules.product.dto.ProductCardRequest;
import com.prostor.prostorApp.modules.product.dto.ProductCardResponse;
import com.prostor.prostorApp.modules.product.model.Brand;
import com.prostor.prostorApp.modules.product.model.Product;
import com.prostor.prostorApp.modules.product.model.ProductCard;
import com.prostor.prostorApp.modules.product.model.Size;
import com.prostor.prostorApp.modules.product.repository.BrandRepository;
import com.prostor.prostorApp.modules.product.repository.ProductCardRepository;
import com.prostor.prostorApp.modules.product.repository.ProductRepository;
import com.prostor.prostorApp.modules.product.repository.SizeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductCardService {

    private final ProductCardRepository productCardRepository;
    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final SizeRepository sizeRepository;

    private ProductCardResponse toResponse(ProductCard card) {
        if (card == null) return null;
        ProductCardResponse response = new ProductCardResponse();
        response.setId(card.getId());
        response.setProductId(card.getProduct() != null ? card.getProduct().getId() : null);
        response.setDescription(card.getDescription());
        response.setType(card.getType());
        response.setPhoto(card.getPhoto());
        response.setIsActive(card.getIsActive());

        if (card.getBrand() != null) {
            com.prostor.prostorApp.modules.product.dto.BrandDto brandDto = new com.prostor.prostorApp.modules.product.dto.BrandDto();
            brandDto.setId(card.getBrand().getId());
            brandDto.setName(card.getBrand().getName());
            response.setBrand(brandDto);
        }

        if (card.getSize() != null) {
            com.prostor.prostorApp.modules.product.dto.SizeDto sizeDto = new com.prostor.prostorApp.modules.product.dto.SizeDto();
            sizeDto.setId(card.getSize().getId());
            sizeDto.setName(card.getSize().getName());
            response.setSize(sizeDto);
        }

        return response;
    }

    private ProductCard toEntity(ProductCardRequest request) {
        if (request == null) return null;
        ProductCard card = new ProductCard();
        card.setDescription(request.getDescription());
        card.setType(request.getType());
        card.setPhoto(request.getPhoto());
        card.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        return card;
    }

    private void updateEntity(ProductCard card, ProductCardRequest request) {
        if (request == null) return;
        card.setDescription(request.getDescription());
        card.setType(request.getType());
        card.setPhoto(request.getPhoto());
        if (request.getIsActive() != null) {
            card.setIsActive(request.getIsActive());
        }
    }

    public List<ProductCardResponse> getByProductId(Integer productId) {
        return productCardRepository.findByProductId(productId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProductCardResponse getById(Integer id) {
        return productCardRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("ProductCard not found with id: " + id));
    }

    @Transactional
    public ProductCardResponse create(ProductCardRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + request.getProductId()));

        ProductCard card = toEntity(request);
        card.setProduct(product);

        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + request.getBrandId()));
            card.setBrand(brand);
        }

        if (request.getSizeId() != null) {
            Size size = sizeRepository.findById(request.getSizeId())
                    .orElseThrow(() -> new EntityNotFoundException("Size not found with id: " + request.getSizeId()));
            card.setSize(size);
        }

        ProductCard saved = productCardRepository.save(card);
        return toResponse(saved);
    }

    @Transactional
    public ProductCardResponse update(Integer id, ProductCardRequest request) {
        ProductCard existing = productCardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ProductCard not found with id: " + id));

        if (!existing.getProduct().getId().equals(request.getProductId())) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + request.getProductId()));
            existing.setProduct(product);
        }

        if (request.getBrandId() != null) {
            if (existing.getBrand() == null || !existing.getBrand().getId().equals(request.getBrandId())) {
                Brand brand = brandRepository.findById(request.getBrandId())
                        .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + request.getBrandId()));
                existing.setBrand(brand);
            }
        } else {
            existing.setBrand(null);
        }

        if (request.getSizeId() != null) {
            if (existing.getSize() == null || !existing.getSize().getId().equals(request.getSizeId())) {
                Size size = sizeRepository.findById(request.getSizeId())
                        .orElseThrow(() -> new EntityNotFoundException("Size not found with id: " + request.getSizeId()));
                existing.setSize(size);
            }
        } else {
            existing.setSize(null);
        }

        updateEntity(existing, request);

        ProductCard updated = productCardRepository.save(existing);
        return toResponse(updated);
    }

    @Transactional
    public void delete(Integer id) {
        if (!productCardRepository.existsById(id)) {
            throw new EntityNotFoundException("ProductCard not found with id: " + id);
        }
        productCardRepository.deleteById(id);
    }
}