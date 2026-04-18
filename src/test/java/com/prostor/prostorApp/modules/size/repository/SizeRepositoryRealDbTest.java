package com.prostor.prostorApp.modules.size.repository;

import com.prostor.prostorApp.modules.product.model.Size;
import com.prostor.prostorApp.modules.product.repository.SizeRepository;
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
@DisplayName("Size Repository Tests (PostgreSQL)")
class SizeRepositoryRealDbTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SizeRepository sizeRepository;

    private Size testSize;

    @BeforeEach
    void setUp() {
        testSize = new Size();
        testSize.setName("Test Size");
        entityManager.persistAndFlush(testSize);
    }

    @Test
    @DisplayName("Should find size by ID when exists")
    void findById_WhenExists_ShouldReturnSize() {
        Optional<Size> found = sizeRepository.findById(testSize.getId());

        assertTrue(found.isPresent());
        assertEquals(testSize.getId(), found.get().getId());
        assertEquals("Test Size", found.get().getName());
    }

    @Test
    @DisplayName("Should return empty when size not found by ID")
    void findById_WhenMissing_ShouldReturnEmpty() {
        assertTrue(sizeRepository.findById(999).isEmpty());
    }

    @Test
    @DisplayName("Should find by name")
    void findByName_WhenExists_ShouldReturnSize() {
        Optional<Size> found = sizeRepository.findByName("Test Size");

        assertTrue(found.isPresent());
        assertEquals(testSize.getId(), found.get().getId());
    }

    @Test
    @DisplayName("Should return empty findByName when unknown")
    void findByName_WhenMissing_ShouldReturnEmpty() {
        assertTrue(sizeRepository.findByName("Unknown").isEmpty());
    }

    @Test
    @DisplayName("Should return true when existsByName matches")
    void existsByName_WhenExists_ShouldReturnTrue() {
        assertTrue(sizeRepository.existsByName("Test Size"));
    }

    @Test
    @DisplayName("Should return false when existsByName has no match")
    void existsByName_WhenMissing_ShouldReturnFalse() {
        assertFalse(sizeRepository.existsByName("Other"));
    }

    @Test
    @DisplayName("Should paginate findAll")
    void findAll_WithPagination_ShouldReturnPage() {
        for (int i = 0; i < 4; i++) {
            Size s = new Size();
            s.setName("Sz " + i);
            entityManager.persistAndFlush(s);
        }

        Pageable pageable = PageRequest.of(0, 2);
        Page<Size> page = sizeRepository.findAll(pageable);

        assertEquals(5, page.getTotalElements());
        assertEquals(2, page.getContent().size());
        assertEquals(3, page.getTotalPages());
    }

    @Test
    @DisplayName("Should sort findAll by name ascending")
    void findAll_WithSortByNameAsc_ShouldOrder() {
        Size zebra = new Size();
        zebra.setName("Zebra");
        entityManager.persistAndFlush(zebra);

        Size alpha = new Size();
        alpha.setName("Alpha");
        entityManager.persistAndFlush(alpha);

        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.ASC, "name"));
        Page<Size> page = sizeRepository.findAll(pageable);

        assertEquals(3, page.getTotalElements());
        assertEquals("Alpha", page.getContent().get(0).getName());
        assertEquals("Test Size", page.getContent().get(1).getName());
        assertEquals("Zebra", page.getContent().get(2).getName());
    }
}
