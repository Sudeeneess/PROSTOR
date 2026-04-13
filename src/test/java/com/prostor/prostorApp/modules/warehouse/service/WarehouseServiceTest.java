package com.prostor.prostorApp.modules.warehouse.service;

import com.prostor.prostorApp.modules.user.model.WarehouseManager;
import com.prostor.prostorApp.modules.user.repository.WarehouseManagerRepository;
import com.prostor.prostorApp.modules.warehouse.dto.WarehouseRequest;
import com.prostor.prostorApp.modules.warehouse.dto.WarehouseResponse;
import com.prostor.prostorApp.modules.warehouse.model.Warehouse;
import com.prostor.prostorApp.modules.warehouse.repository.WarehouseRepository;
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
@DisplayName("Warehouse Service Tests")
class WarehouseServiceTest {

    @Mock
    private WarehouseRepository warehouseRepository;
    @Mock
    private WarehouseManagerRepository warehouseManagerRepository;

    @InjectMocks
    private WarehouseService warehouseService;

    private WarehouseManager manager;
    private Warehouse warehouse;
    private WarehouseRequest request;

    @BeforeEach
    void setUp() {
        manager = new WarehouseManager();
        manager.setId(1);

        warehouse = new Warehouse();
        warehouse.setId(10);
        warehouse.setWarehouseManager(manager);
        warehouse.setWarehouseAddress("Addr 1");

        request = new WarehouseRequest();
        request.setWarehouseManagerId(1);
        request.setWarehouseAddress("Addr 1");
    }

    @Test
    @DisplayName("Should return warehouse by id")
    void getById_WhenExists_ShouldReturnResponse() {
        when(warehouseRepository.findById(10)).thenReturn(Optional.of(warehouse));

        WarehouseResponse r = warehouseService.getById(10);

        assertEquals(10, r.getId());
        assertEquals("Addr 1", r.getWarehouseAddress());
        assertEquals(1, r.getWarehouseManagerId());
    }

    @Test
    @DisplayName("Should throw when warehouse not found")
    void getById_WhenMissing_ShouldThrow() {
        when(warehouseRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> warehouseService.getById(1));
    }

    @Test
    @DisplayName("Should page all warehouses")
    void getAll_ShouldReturnPage() {
        Pageable p = PageRequest.of(0, 10);
        when(warehouseRepository.findAll(p)).thenReturn(new PageImpl<>(List.of(warehouse), p, 1));

        Page<WarehouseResponse> page = warehouseService.getAll(p);

        assertEquals(1, page.getTotalElements());
    }

    @Test
    @DisplayName("Should create warehouse when manager exists")
    void create_WhenValid_ShouldSave() {
        when(warehouseManagerRepository.findById(1)).thenReturn(Optional.of(manager));
        when(warehouseRepository.save(any(Warehouse.class))).thenAnswer(inv -> {
            Warehouse w = inv.getArgument(0);
            w.setId(20);
            return w;
        });

        WarehouseResponse r = warehouseService.create(request);

        assertEquals(20, r.getId());
        verify(warehouseRepository).save(any(Warehouse.class));
    }

    @Test
    @DisplayName("Should throw when manager missing on create")
    void create_WhenManagerMissing_ShouldThrow() {
        when(warehouseManagerRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> warehouseService.create(request));
        verify(warehouseRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should update warehouse")
    void update_WhenValid_ShouldSave() {
        WarehouseRequest upd = new WarehouseRequest();
        upd.setWarehouseManagerId(1);
        upd.setWarehouseAddress("New Addr");

        when(warehouseRepository.findById(10)).thenReturn(Optional.of(warehouse));
        when(warehouseRepository.save(any(Warehouse.class))).thenAnswer(inv -> inv.getArgument(0));

        WarehouseResponse r = warehouseService.update(10, upd);

        assertEquals("New Addr", r.getWarehouseAddress());
        verify(warehouseManagerRepository, never()).findById(anyInt());
    }

    @Test
    @DisplayName("Should load new manager when id changes on update")
    void update_WhenManagerChanges_ShouldLoadManager() {
        WarehouseManager other = new WarehouseManager();
        other.setId(2);

        WarehouseRequest upd = new WarehouseRequest();
        upd.setWarehouseManagerId(2);
        upd.setWarehouseAddress("Addr");

        when(warehouseRepository.findById(10)).thenReturn(Optional.of(warehouse));
        when(warehouseManagerRepository.findById(2)).thenReturn(Optional.of(other));
        when(warehouseRepository.save(any(Warehouse.class))).thenAnswer(inv -> inv.getArgument(0));

        warehouseService.update(10, upd);

        verify(warehouseManagerRepository).findById(2);
    }

    @Test
    @DisplayName("Should throw when warehouse missing on update")
    void update_WhenWarehouseMissing_ShouldThrow() {
        when(warehouseRepository.findById(10)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> warehouseService.update(10, request));
    }

    @Test
    @DisplayName("Should throw when new manager id not found on update")
    void update_WhenNewManagerMissing_ShouldThrow() {
        WarehouseRequest upd = new WarehouseRequest();
        upd.setWarehouseManagerId(99);
        upd.setWarehouseAddress("A");

        when(warehouseRepository.findById(10)).thenReturn(Optional.of(warehouse));
        when(warehouseManagerRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> warehouseService.update(10, upd));
        verify(warehouseRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should delete when exists")
    void delete_WhenExists_ShouldDelete() {
        when(warehouseRepository.existsById(10)).thenReturn(true);

        warehouseService.delete(10);

        verify(warehouseRepository).deleteById(10);
    }

    @Test
    @DisplayName("Should throw when deleting missing warehouse")
    void delete_WhenMissing_ShouldThrow() {
        when(warehouseRepository.existsById(10)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> warehouseService.delete(10));
        verify(warehouseRepository, never()).deleteById(anyInt());
    }
}
