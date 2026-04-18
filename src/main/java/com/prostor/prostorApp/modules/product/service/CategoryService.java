package com.prostor.prostorApp.modules.product.service;

import com.prostor.prostorApp.modules.product.dto.CategoryRequest;
import com.prostor.prostorApp.modules.product.dto.CategoryResponse;
import com.prostor.prostorApp.modules.product.model.Category;
import com.prostor.prostorApp.modules.product.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    private CategoryResponse toResponse(Category category) {
        if (category == null) return null;
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setCategoryName(category.getCategoryName());
        return response;
    }

    private Category toEntity(CategoryRequest request) {
        if (request == null) return null;
        Category category = new Category();
        category.setCategoryName(request.getCategoryName());
        return category;
    }

    private void updateEntity(Category category, CategoryRequest request) {
        if (request == null) return;
        category.setCategoryName(request.getCategoryName());
    }

    public Page<CategoryResponse> getAll(Pageable pageable) {
        return categoryRepository.findAll(pageable).map(this::toResponse);
    }

    public CategoryResponse getById(Integer id) {
        return categoryRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
    }


    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByCategoryName(request.getCategoryName())) {
            throw new IllegalArgumentException("Category with name '" + request.getCategoryName() + "' already exists");
        }
        Category category = toEntity(request);
        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    @Transactional
    public CategoryResponse update(Integer id, CategoryRequest request) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));


        if (!existing.getCategoryName().equals(request.getCategoryName()) &&
                categoryRepository.existsByCategoryName(request.getCategoryName())) {
            throw new IllegalArgumentException("Category with name '" + request.getCategoryName() + "' already exists");
        }

        updateEntity(existing, request);
        Category updated = categoryRepository.save(existing);
        return toResponse(updated);
    }

    @Transactional
    public void delete(Integer id) {
        if (!categoryRepository.existsById(id)) {
            throw new EntityNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
