package com.prostor.prostorApp.modules.brand.service;

import com.prostor.prostorApp.modules.product.dto.BrandRequest;
import com.prostor.prostorApp.modules.product.dto.BrandResponse;
import com.prostor.prostorApp.modules.product.model.Brand;
import com.prostor.prostorApp.modules.product.repository.BrandRepository;
import com.prostor.prostorApp.modules.product.service.BrandService;
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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Brand Service Tests")
class BrandServiceTest {

    @Mock
    private BrandRepository brandRepository;

    @InjectMocks
    private BrandService brandService;

    private Brand testBrand;
    private BrandRequest testRequest;

    @BeforeEach
    void setUp() {
        testBrand = new Brand();
        testBrand.setId(1);
        testBrand.setName("Acme");

        testRequest = new BrandRequest();
        testRequest.setName("Acme");
    }

    @Test
    @DisplayName("Should return brand when found by ID")
    void getById_WhenExists_ShouldReturnResponse() {
        when(brandRepository.findById(1)).thenReturn(Optional.of(testBrand));

        BrandResponse result = brandService.getById(1);

        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals("Acme", result.getName());
        verify(brandRepository).findById(1);
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when brand not found by ID")
    void getById_WhenMissing_ShouldThrow() {
        when(brandRepository.findById(99)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> brandService.getById(99));

        assertEquals("Brand not found with id: 99", ex.getMessage());
    }

    @Test
    @DisplayName("Should return all brands with pagination")
    void getAll_ShouldReturnPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Brand> page = new PageImpl<>(List.of(testBrand), pageable, 1);
        when(brandRepository.findAll(pageable)).thenReturn(page);

        Page<BrandResponse> result = brandService.getAll(pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Acme", result.getContent().get(0).getName());
        verify(brandRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Should create brand when name is unique")
    void create_WhenNameUnique_ShouldSaveAndReturn() {
        when(brandRepository.existsByName("Beta")).thenReturn(false);
        Brand saved = new Brand();
        saved.setId(2);
        saved.setName("Beta");
        BrandRequest req = new BrandRequest();
        req.setName("Beta");
        when(brandRepository.save(any(Brand.class))).thenReturn(saved);

        BrandResponse result = brandService.create(req);

        assertEquals(2, result.getId());
        assertEquals("Beta", result.getName());
        verify(brandRepository).existsByName("Beta");
        verify(brandRepository).save(any(Brand.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when brand name already exists on create")
    void create_WhenDuplicateName_ShouldThrow() {
        when(brandRepository.existsByName("Acme")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> brandService.create(testRequest));

        assertTrue(ex.getMessage().contains("already exists"));
        verify(brandRepository).existsByName("Acme");
        verify(brandRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should update brand when valid")
    void update_WhenValid_ShouldReturnUpdated() {
        BrandRequest updateReq = new BrandRequest();
        updateReq.setName("Home");

        Brand updated = new Brand();
        updated.setId(1);
        updated.setName("Home");

        when(brandRepository.findById(1)).thenReturn(Optional.of(testBrand));
        when(brandRepository.existsByName("Home")).thenReturn(false);
        when(brandRepository.save(any(Brand.class))).thenReturn(updated);

        BrandResponse result = brandService.update(1, updateReq);

        assertEquals("Home", result.getName());
        verify(brandRepository).save(any(Brand.class));
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when updating missing brand")
    void update_WhenMissing_ShouldThrow() {
        when(brandRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> brandService.update(1, testRequest));
        verify(brandRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when new name conflicts on update")
    void update_WhenNewNameTaken_ShouldThrow() {
        BrandRequest updateReq = new BrandRequest();
        updateReq.setName("Taken");

        when(brandRepository.findById(1)).thenReturn(Optional.of(testBrand));
        when(brandRepository.existsByName("Taken")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> brandService.update(1, updateReq));
        verify(brandRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should allow update when name unchanged")
    void update_WhenSameName_ShouldSave() {
        when(brandRepository.findById(1)).thenReturn(Optional.of(testBrand));
        when(brandRepository.save(any(Brand.class))).thenReturn(testBrand);

        BrandResponse result = brandService.update(1, testRequest);

        assertEquals("Acme", result.getName());
        verify(brandRepository, never()).existsByName(anyString());
        verify(brandRepository).save(any(Brand.class));
    }

    @Test
    @DisplayName("Should delete brand when exists")
    void delete_WhenExists_ShouldDelete() {
        when(brandRepository.existsById(1)).thenReturn(true);

        brandService.delete(1);

        verify(brandRepository).deleteById(1);
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when deleting missing brand")
    void delete_WhenMissing_ShouldThrow() {
        when(brandRepository.existsById(1)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> brandService.delete(1));
        verify(brandRepository, never()).deleteById(anyInt());
    }
}
