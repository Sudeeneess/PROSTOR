package com.prostor.prostorApp.modules.category.repository;

import com.prostor.prostorApp.modules.product.model.Category;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("Category Repository Tests (PostgreSQL)")
class CategoryRepositoryRealDbTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CategoryRepository categoryRepository;

    private Category testCategory;

    @BeforeEach
    void setUp() {
        testCategory = new Category();
        testCategory.setCategoryName("Test Category");
        entityManager.persistAndFlush(testCategory);
    }

    @Test
    @DisplayName("Should find category by ID when exists")
    void findById_WhenExists_ShouldReturnCategory() {
        Optional<Category> found = categoryRepository.findById(testCategory.getId());

        assertTrue(found.isPresent());
        assertEquals(testCategory.getId(), found.get().getId());
        assertEquals("Test Category", found.get().getCategoryName());
    }

    @Test
    @DisplayName("Should return empty when category not found by ID")
    void findById_WhenMissing_ShouldReturnEmpty() {
        assertTrue(categoryRepository.findById(999).isEmpty());
    }

    @Test
    @DisplayName("Should find by category name")
    void findByCategoryName_WhenExists_ShouldReturnCategory() {
        Optional<Category> found = categoryRepository.findByCategoryName("Test Category");

        assertTrue(found.isPresent());
        assertEquals(testCategory.getId(), found.get().getId());
    }

    @Test
    @DisplayName("Should return empty findByCategoryName when unknown")
    void findByCategoryName_WhenMissing_ShouldReturnEmpty() {
        assertTrue(categoryRepository.findByCategoryName("Unknown").isEmpty());
    }

    @Test
    @DisplayName("Should return true when existsByCategoryName matches")
    void existsByCategoryName_WhenExists_ShouldReturnTrue() {
        assertTrue(categoryRepository.existsByCategoryName("Test Category"));
    }

    @Test
    @DisplayName("Should return false when existsByCategoryName has no match")
    void existsByCategoryName_WhenMissing_ShouldReturnFalse() {
        assertFalse(categoryRepository.existsByCategoryName("Other"));
    }

    @Test
    @DisplayName("Should paginate findAll")
    void findAll_WithPagination_ShouldReturnPage() {
        for (int i = 0; i < 4; i++) {
            Category c = new Category();
            c.setCategoryName("Cat " + i);
            entityManager.persistAndFlush(c);
        }

        Pageable pageable = PageRequest.of(0, 2);
        Page<Category> page = categoryRepository.findAll(pageable);

        assertEquals(5, page.getTotalElements());
        assertEquals(2, page.getContent().size());
        assertEquals(3, page.getTotalPages());
    }

    @Test
    @DisplayName("Should sort findAll by categoryName ascending")
    void findAll_WithSortByNameAsc_ShouldOrder() {
        Category zebra = new Category();
        zebra.setCategoryName("Zebra");
        entityManager.persistAndFlush(zebra);

        Category alpha = new Category();
        alpha.setCategoryName("Alpha");
        entityManager.persistAndFlush(alpha);

        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.ASC, "categoryName"));
        Page<Category> page = categoryRepository.findAll(pageable);

        assertEquals(3, page.getTotalElements());
        assertEquals("Alpha", page.getContent().get(0).getCategoryName());
        assertEquals("Test Category", page.getContent().get(1).getCategoryName());
        assertEquals("Zebra", page.getContent().get(2).getCategoryName());
    }
}
