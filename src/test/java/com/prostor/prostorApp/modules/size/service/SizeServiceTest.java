package com.prostor.prostorApp.modules.size.service;

import com.prostor.prostorApp.modules.product.dto.SizeRequest;
import com.prostor.prostorApp.modules.product.dto.SizeResponse;
import com.prostor.prostorApp.modules.product.model.Size;
import com.prostor.prostorApp.modules.product.repository.SizeRepository;
import com.prostor.prostorApp.modules.product.service.SizeService;
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
@DisplayName("Size Service Tests")
class SizeServiceTest {

    @Mock
    private SizeRepository sizeRepository;

    @InjectMocks
    private SizeService sizeService;

    private Size testSize;
    private SizeRequest testRequest;

    @BeforeEach
    void setUp() {
        testSize = new Size();
        testSize.setId(1);
        testSize.setName("M");

        testRequest = new SizeRequest();
        testRequest.setName("M");
    }

    @Test
    @DisplayName("Should return size when found by ID")
    void getById_WhenExists_ShouldReturnResponse() {
        when(sizeRepository.findById(1)).thenReturn(Optional.of(testSize));

        SizeResponse result = sizeService.getById(1);

        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals("M", result.getName());
        verify(sizeRepository).findById(1);
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when size not found by ID")
    void getById_WhenMissing_ShouldThrow() {
        when(sizeRepository.findById(99)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> sizeService.getById(99));

        assertEquals("Size not found with id: 99", ex.getMessage());
    }

    @Test
    @DisplayName("Should return all sizes with pagination")
    void getAll_ShouldReturnPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Size> page = new PageImpl<>(List.of(testSize), pageable, 1);
        when(sizeRepository.findAll(pageable)).thenReturn(page);

        Page<SizeResponse> result = sizeService.getAll(pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("M", result.getContent().get(0).getName());
        verify(sizeRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Should create size when name is unique")
    void create_WhenNameUnique_ShouldSaveAndReturn() {
        when(sizeRepository.existsByName("XL")).thenReturn(false);
        Size saved = new Size();
        saved.setId(2);
        saved.setName("XL");
        SizeRequest req = new SizeRequest();
        req.setName("XL");
        when(sizeRepository.save(any(Size.class))).thenReturn(saved);

        SizeResponse result = sizeService.create(req);

        assertEquals(2, result.getId());
        assertEquals("XL", result.getName());
        verify(sizeRepository).existsByName("XL");
        verify(sizeRepository).save(any(Size.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when size name already exists on create")
    void create_WhenDuplicateName_ShouldThrow() {
        when(sizeRepository.existsByName("M")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> sizeService.create(testRequest));

        assertTrue(ex.getMessage().contains("already exists"));
        verify(sizeRepository).existsByName("M");
        verify(sizeRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should update size when valid")
    void update_WhenValid_ShouldReturnUpdated() {
        SizeRequest updateReq = new SizeRequest();
        updateReq.setName("L");

        Size updated = new Size();
        updated.setId(1);
        updated.setName("L");

        when(sizeRepository.findById(1)).thenReturn(Optional.of(testSize));
        when(sizeRepository.existsByName("L")).thenReturn(false);
        when(sizeRepository.save(any(Size.class))).thenReturn(updated);

        SizeResponse result = sizeService.update(1, updateReq);

        assertEquals("L", result.getName());
        verify(sizeRepository).save(any(Size.class));
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when updating missing size")
    void update_WhenMissing_ShouldThrow() {
        when(sizeRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> sizeService.update(1, testRequest));
        verify(sizeRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when new name conflicts on update")
    void update_WhenNewNameTaken_ShouldThrow() {
        SizeRequest updateReq = new SizeRequest();
        updateReq.setName("Taken");

        when(sizeRepository.findById(1)).thenReturn(Optional.of(testSize));
        when(sizeRepository.existsByName("Taken")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> sizeService.update(1, updateReq));
        verify(sizeRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should allow update when name unchanged")
    void update_WhenSameName_ShouldSave() {
        when(sizeRepository.findById(1)).thenReturn(Optional.of(testSize));
        when(sizeRepository.save(any(Size.class))).thenReturn(testSize);

        SizeResponse result = sizeService.update(1, testRequest);

        assertEquals("M", result.getName());
        verify(sizeRepository, never()).existsByName(anyString());
        verify(sizeRepository).save(any(Size.class));
    }

    @Test
    @DisplayName("Should delete size when exists")
    void delete_WhenExists_ShouldDelete() {
        when(sizeRepository.existsById(1)).thenReturn(true);

        sizeService.delete(1);

        verify(sizeRepository).deleteById(1);
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when deleting missing size")
    void delete_WhenMissing_ShouldThrow() {
        when(sizeRepository.existsById(1)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> sizeService.delete(1));
        verify(sizeRepository, never()).deleteById(anyInt());
    }
}
