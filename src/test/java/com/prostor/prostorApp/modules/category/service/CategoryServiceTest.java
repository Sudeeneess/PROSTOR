package com.prostor.prostorApp.modules.category.service;

import com.prostor.prostorApp.modules.product.dto.CategoryRequest;
import com.prostor.prostorApp.modules.product.dto.CategoryResponse;
import com.prostor.prostorApp.modules.product.model.Category;
import com.prostor.prostorApp.modules.product.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Category Service Tests")
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category testCategory;
    private CategoryRequest testRequest;

    @BeforeEach
    void setUp() {
        testCategory = new Category();
        testCategory.setId(1);
        testCategory.setCategoryName("Electronics");

        testRequest = new CategoryRequest();
        testRequest.setCategoryName("Electronics");
    }

    @Test
    @DisplayName("Should return category when found by ID")
    void getById_WhenExists_ShouldReturnResponse() {
        when(categoryRepository.findById(1)).thenReturn(Optional.of(testCategory));

        CategoryResponse result = categoryService.getById(1);

        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals("Electronics", result.getCategoryName());
        verify(categoryRepository).findById(1);
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when category not found by ID")
    void getById_WhenMissing_ShouldThrow() {
        when(categoryRepository.findById(99)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> categoryService.getById(99));

        assertEquals("Category not found with id: 99", ex.getMessage());
    }

    @Test
    @DisplayName("Should return all categories with pagination")
    void getAll_ShouldReturnPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Category> page = new PageImpl<>(List.of(testCategory), pageable, 1);
        when(categoryRepository.findAll(pageable)).thenReturn(page);

        Page<CategoryResponse> result = categoryService.getAll(pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Electronics", result.getContent().get(0).getCategoryName());
        verify(categoryRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Should create category when name is unique")
    void create_WhenNameUnique_ShouldSaveAndReturn() {
        when(categoryRepository.existsByCategoryName("Books")).thenReturn(false);
        Category saved = new Category();
        saved.setId(2);
        saved.setCategoryName("Books");
        CategoryRequest req = new CategoryRequest();
        req.setCategoryName("Books");
        when(categoryRepository.save(any(Category.class))).thenReturn(saved);

        CategoryResponse result = categoryService.create(req);

        assertEquals(2, result.getId());
        assertEquals("Books", result.getCategoryName());
        verify(categoryRepository).existsByCategoryName("Books");
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when category name already exists on create")
    void create_WhenDuplicateName_ShouldThrow() {
        when(categoryRepository.existsByCategoryName("Electronics")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> categoryService.create(testRequest));

        assertTrue(ex.getMessage().contains("already exists"));
        verify(categoryRepository).existsByCategoryName("Electronics");
        verify(categoryRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should update category when valid")
    void update_WhenValid_ShouldReturnUpdated() {
        CategoryRequest updateReq = new CategoryRequest();
        updateReq.setCategoryName("Home");

        Category updated = new Category();
        updated.setId(1);
        updated.setCategoryName("Home");

        when(categoryRepository.findById(1)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.existsByCategoryName("Home")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenReturn(updated);

        CategoryResponse result = categoryService.update(1, updateReq);

        assertEquals("Home", result.getCategoryName());
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when updating missing category")
    void update_WhenMissing_ShouldThrow() {
        when(categoryRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> categoryService.update(1, testRequest));
        verify(categoryRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when new name conflicts on update")
    void update_WhenNewNameTaken_ShouldThrow() {
        CategoryRequest updateReq = new CategoryRequest();
        updateReq.setCategoryName("Taken");

        when(categoryRepository.findById(1)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.existsByCategoryName("Taken")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> categoryService.update(1, updateReq));
        verify(categoryRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should allow update when name unchanged")
    void update_WhenSameName_ShouldSave() {
        when(categoryRepository.findById(1)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);

        CategoryResponse result = categoryService.update(1, testRequest);

        assertEquals("Electronics", result.getCategoryName());
        verify(categoryRepository, never()).existsByCategoryName(anyString());
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("Should delete category when exists")
    void delete_WhenExists_ShouldDelete() {
        when(categoryRepository.existsById(1)).thenReturn(true);

        categoryService.delete(1);

        verify(categoryRepository).deleteById(1);
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when deleting missing category")
    void delete_WhenMissing_ShouldThrow() {
        when(categoryRepository.existsById(1)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> categoryService.delete(1));
        verify(categoryRepository, never()).deleteById(anyInt());
    }
}
