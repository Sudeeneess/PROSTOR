package com.prostor.prostorApp.modules.product.service;

import com.prostor.prostorApp.modules.product.dto.BrandRequest;
import com.prostor.prostorApp.modules.product.dto.BrandResponse;
import com.prostor.prostorApp.modules.product.model.Brand;
import com.prostor.prostorApp.modules.product.repository.BrandRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BrandService {

    private final BrandRepository brandRepository;

    private BrandResponse toResponse(Brand brand) {
        if (brand == null) return null;
        BrandResponse response = new BrandResponse();
        response.setId(brand.getId());
        response.setName(brand.getName());
        return response;
    }

    private Brand toEntity(BrandRequest request) {
        if (request == null) return null;
        Brand brand = new Brand();
        brand.setName(request.getName());
        return brand;
    }

    private void updateEntity(Brand brand, BrandRequest request) {
        if (request == null) return;
        brand.setName(request.getName());
    }

    public Page<BrandResponse> getAll(Pageable pageable) {
        return brandRepository.findAll(pageable).map(this::toResponse);
    }

    public BrandResponse getById(Integer id) {
        return brandRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));
    }

    @Transactional
    public BrandResponse create(BrandRequest request) {
        if (brandRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Brand with name '" + request.getName() + "' already exists");
        }
        Brand brand = toEntity(request);
        Brand saved = brandRepository.save(brand);
        return toResponse(saved);
    }

    @Transactional
    public BrandResponse update(Integer id, BrandRequest request) {
        Brand existing = brandRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));


        if (!existing.getName().equals(request.getName()) && brandRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Brand with name '" + request.getName() + "' already exists");
        }

        updateEntity(existing, request);
        Brand updated = brandRepository.save(existing);
        return toResponse(updated);
    }

    @Transactional
    public void delete(Integer id) {
        if (!brandRepository.existsById(id)) {
            throw new EntityNotFoundException("Brand not found with id: " + id);
        }
        brandRepository.deleteById(id);
    }
}
