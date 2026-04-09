package com.prostor.prostorApp.modules.product.repository;

import com.prostor.prostorApp.modules.product.model.Brand;
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
@DisplayName("Brand Repository Tests (PostgreSQL)")
class BrandRepositoryRealDbTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private BrandRepository brandRepository;

    private Brand testBrand;

    @BeforeEach
    void setUp() {
        testBrand = new Brand();
        testBrand.setName("Test Brand");
        entityManager.persistAndFlush(testBrand);
    }

    @Test
    @DisplayName("Should find brand by ID when exists")
    void findById_WhenExists_ShouldReturnBrand() {
        Optional<Brand> found = brandRepository.findById(testBrand.getId());

        assertTrue(found.isPresent());
        assertEquals(testBrand.getId(), found.get().getId());
        assertEquals("Test Brand", found.get().getName());
    }

    @Test
    @DisplayName("Should return empty when brand not found by ID")
    void findById_WhenMissing_ShouldReturnEmpty() {
        assertTrue(brandRepository.findById(999).isEmpty());
    }

    @Test
    @DisplayName("Should find by name")
    void findByName_WhenExists_ShouldReturnBrand() {
        Optional<Brand> found = brandRepository.findByName("Test Brand");

        assertTrue(found.isPresent());
        assertEquals(testBrand.getId(), found.get().getId());
    }

    @Test
    @DisplayName("Should return empty findByName when unknown")
    void findByName_WhenMissing_ShouldReturnEmpty() {
        assertTrue(brandRepository.findByName("Unknown").isEmpty());
    }

    @Test
    @DisplayName("Should return true when existsByName matches")
    void existsByName_WhenExists_ShouldReturnTrue() {
        assertTrue(brandRepository.existsByName("Test Brand"));
    }

    @Test
    @DisplayName("Should return false when existsByName has no match")
    void existsByName_WhenMissing_ShouldReturnFalse() {
        assertFalse(brandRepository.existsByName("Other"));
    }

    @Test
    @DisplayName("Should paginate findAll")
    void findAll_WithPagination_ShouldReturnPage() {
        for (int i = 0; i < 4; i++) {
            Brand b = new Brand();
            b.setName("Brand " + i);
            entityManager.persistAndFlush(b);
        }

        Pageable pageable = PageRequest.of(0, 2);
        Page<Brand> page = brandRepository.findAll(pageable);

        assertEquals(5, page.getTotalElements());
        assertEquals(2, page.getContent().size());
        assertEquals(3, page.getTotalPages());
    }

    @Test
    @DisplayName("Should sort findAll by name ascending")
    void findAll_WithSortByNameAsc_ShouldOrder() {
        Brand zebra = new Brand();
        zebra.setName("Zebra");
        entityManager.persistAndFlush(zebra);

        Brand alpha = new Brand();
        alpha.setName("Alpha");
        entityManager.persistAndFlush(alpha);

        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.ASC, "name"));
        Page<Brand> page = brandRepository.findAll(pageable);

        assertEquals(3, page.getTotalElements());
        assertEquals("Alpha", page.getContent().get(0).getName());
        assertEquals("Test Brand", page.getContent().get(1).getName());
        assertEquals("Zebra", page.getContent().get(2).getName());
    }
}
