package com.prostor.prostorApp.modules.warehouse.service;

import com.prostor.prostorApp.modules.product.model.Category;
import com.prostor.prostorApp.modules.product.model.Product;
import com.prostor.prostorApp.modules.product.repository.ProductRepository;
import com.prostor.prostorApp.modules.user.model.Seller;
import com.prostor.prostorApp.modules.warehouse.dto.WarehouseStockRequest;
import com.prostor.prostorApp.modules.warehouse.dto.WarehouseStockResponse;
import com.prostor.prostorApp.modules.warehouse.model.Warehouse;
import com.prostor.prostorApp.modules.warehouse.model.WarehouseStock;
import com.prostor.prostorApp.modules.warehouse.repository.WarehouseRepository;
import com.prostor.prostorApp.modules.warehouse.repository.WarehouseStockRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("WarehouseStock Service Tests")
class WarehouseStockServiceTest {

    @Mock
    private WarehouseStockRepository stockRepository;
    @Mock
    private WarehouseRepository warehouseRepository;
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private WarehouseStockService warehouseStockService;

    private Warehouse warehouse;
    private Product product;
    private WarehouseStock stock;
    private WarehouseStockRequest request;

    @BeforeEach
    void setUp() {
        warehouse = new Warehouse();
        warehouse.setId(1);
        warehouse.setWarehouseAddress("W1");

        Category cat = new Category();
        cat.setId(1);
        Seller seller = new Seller();
        seller.setId(1);
        product = new Product();
        product.setId(10);
        product.setName("P1");
        product.setPrice(1.0);
        product.setSeller(seller);
        product.setCategory(cat);

        stock = new WarehouseStock();
        stock.setId(100);
        stock.setWarehouse(warehouse);
        stock.setProduct(product);
        stock.setQuantity(50);
        stock.setReservedQuantity(0);
        stock.setSoldQuantity(0);

        request = new WarehouseStockRequest();
        request.setWarehouseId(1);
        request.setProductId(10);
        request.setQuantity(50);
    }

    @Test
    @DisplayName("getAll with no filters should use findAll")
    void getAll_NoFilters_ShouldUseFindAll() {
        when(stockRepository.findAll()).thenReturn(List.of(stock));

        List<WarehouseStockResponse> list = warehouseStockService.getAll(null, null);

        assertEquals(1, list.size());
        assertEquals(100, list.get(0).getId());
        verify(stockRepository).findAll();
    }

    @Test
    @DisplayName("getAll with warehouseId should filter")
    void getAll_ByWarehouse_ShouldUseFindByWarehouseId() {
        when(stockRepository.findByWarehouseId(1)).thenReturn(List.of(stock));

        List<WarehouseStockResponse> list = warehouseStockService.getAll(1, null);

        assertEquals(1, list.size());
        verify(stockRepository).findByWarehouseId(1);
    }

    @Test
    @DisplayName("getAll with productId should filter")
    void getAll_ByProduct_ShouldUseFindByProductId() {
        when(stockRepository.findByProductId(10)).thenReturn(List.of(stock));

        List<WarehouseStockResponse> list = warehouseStockService.getAll(null, 10);

        assertEquals(1, list.size());
        verify(stockRepository).findByProductId(10);
    }

    @Test
    @DisplayName("getAll with both ids should use compound lookup")
    void getAll_ByWarehouseAndProduct_ShouldUseOptional() {
        when(stockRepository.findByWarehouseIdAndProductId(1, 10)).thenReturn(Optional.of(stock));

        List<WarehouseStockResponse> list = warehouseStockService.getAll(1, 10);

        assertEquals(1, list.size());
    }

    @Test
    @DisplayName("getAll with both ids empty when no row")
    void getAll_ByWarehouseAndProduct_Empty() {
        when(stockRepository.findByWarehouseIdAndProductId(1, 10)).thenReturn(Optional.empty());

        assertTrue(warehouseStockService.getAll(1, 10).isEmpty());
    }

    @Test
    @DisplayName("getById returns response")
    void getById_WhenExists() {
        when(stockRepository.findById(100)).thenReturn(Optional.of(stock));

        WarehouseStockResponse r = warehouseStockService.getById(100);

        assertEquals(100, r.getId());
        assertEquals("P1", r.getProductName());
    }

    @Test
    @DisplayName("getById throws when missing")
    void getById_WhenMissing() {
        when(stockRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> warehouseStockService.getById(1));
    }

    @Test
    @DisplayName("create saves new stock")
    void create_WhenValid_ShouldSave() {
        when(warehouseRepository.findById(1)).thenReturn(Optional.of(warehouse));
        when(productRepository.findById(10)).thenReturn(Optional.of(product));
        when(stockRepository.findByWarehouseIdAndProductId(1, 10)).thenReturn(Optional.empty());
        when(stockRepository.save(any(WarehouseStock.class))).thenAnswer(inv -> {
            WarehouseStock s = inv.getArgument(0);
            s.setId(200);
            return s;
        });

        WarehouseStockResponse r = warehouseStockService.create(request);

        assertEquals(200, r.getId());
        verify(stockRepository).save(any(WarehouseStock.class));
    }

    @Test
    @DisplayName("create throws when warehouse missing")
    void create_WhenWarehouseMissing() {
        when(warehouseRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> warehouseStockService.create(request));
        verify(stockRepository, never()).save(any());
    }

    @Test
    @DisplayName("create throws when product missing")
    void create_WhenProductMissing() {
        when(warehouseRepository.findById(1)).thenReturn(Optional.of(warehouse));
        when(productRepository.findById(10)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> warehouseStockService.create(request));
    }

    @Test
    @DisplayName("create throws when duplicate warehouse+product")
    void create_WhenDuplicate_ShouldThrowIllegalArgument() {
        when(warehouseRepository.findById(1)).thenReturn(Optional.of(warehouse));
        when(productRepository.findById(10)).thenReturn(Optional.of(product));
        when(stockRepository.findByWarehouseIdAndProductId(1, 10)).thenReturn(Optional.of(stock));

        assertThrows(IllegalArgumentException.class, () -> warehouseStockService.create(request));
        verify(stockRepository, never()).save(any());
    }

    @Test
    @DisplayName("update modifies stock")
    void update_WhenValid_ShouldSave() {
        WarehouseStockRequest upd = new WarehouseStockRequest();
        upd.setWarehouseId(1);
        upd.setProductId(10);
        upd.setQuantity(99);

        when(stockRepository.findById(100)).thenReturn(Optional.of(stock));
        when(stockRepository.save(any(WarehouseStock.class))).thenAnswer(inv -> inv.getArgument(0));

        WarehouseStockResponse r = warehouseStockService.update(100, upd);

        assertEquals(99, r.getQuantity().intValue());
    }

    @Test
    @DisplayName("update throws when stock missing")
    void update_WhenMissing() {
        when(stockRepository.findById(100)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> warehouseStockService.update(100, request));
    }

    @Test
    @DisplayName("update throws when new warehouse id not found")
    void update_WhenWarehouseChangeMissing() {
        WarehouseStockRequest upd = new WarehouseStockRequest();
        upd.setWarehouseId(2);
        upd.setProductId(10);
        upd.setQuantity(1);

        when(stockRepository.findById(100)).thenReturn(Optional.of(stock));
        when(warehouseRepository.findById(2)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> warehouseStockService.update(100, upd));
        verify(stockRepository, never()).save(any());
    }

    @Test
    @DisplayName("update throws when new product id not found")
    void update_WhenProductChangeMissing() {
        WarehouseStockRequest upd = new WarehouseStockRequest();
        upd.setWarehouseId(1);
        upd.setProductId(20);
        upd.setQuantity(1);

        when(stockRepository.findById(100)).thenReturn(Optional.of(stock));
        when(productRepository.findById(20)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> warehouseStockService.update(100, upd));
        verify(stockRepository, never()).save(any());
    }

    @Test
    @DisplayName("delete removes stock")
    void delete_WhenExists() {
        when(stockRepository.existsById(100)).thenReturn(true);

        warehouseStockService.delete(100);

        verify(stockRepository).deleteById(100);
    }

    @Test
    @DisplayName("delete throws when missing")
    void delete_WhenMissing() {
        when(stockRepository.existsById(100)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> warehouseStockService.delete(100));
    }

    @Test
    @DisplayName("getTotalAvailableQuantity returns 0 when null sum")
    void getTotalAvailableQuantity_NullSum() {
        when(stockRepository.getTotalQuantityByProductId(10)).thenReturn(null);

        assertEquals(0, warehouseStockService.getTotalAvailableQuantity(10));
    }

    @Test
    @DisplayName("getTotalAvailableQuantity returns sum")
    void getTotalAvailableQuantity_WithSum() {
        when(stockRepository.getTotalQuantityByProductId(10)).thenReturn(42);

        assertEquals(42, warehouseStockService.getTotalAvailableQuantity(10));
    }

    @Test
    @DisplayName("reserveProduct true when rows updated")
    void reserveProduct_WhenUpdated() {
        when(stockRepository.reserveProduct(10, 2)).thenReturn(1);

        assertTrue(warehouseStockService.reserveProduct(10, 2));
    }

    @Test
    @DisplayName("reserveProduct false when no rows updated")
    void reserveProduct_WhenNone() {
        when(stockRepository.reserveProduct(10, 2)).thenReturn(0);

        assertFalse(warehouseStockService.reserveProduct(10, 2));
    }

    @Test
    @DisplayName("releaseProduct true when rows updated")
    void releaseProduct_WhenUpdated() {
        when(stockRepository.releaseProduct(10, 1)).thenReturn(1);

        assertTrue(warehouseStockService.releaseProduct(10, 1));
    }

    @Test
    @DisplayName("releaseProduct false when no rows updated")
    void releaseProduct_WhenNone() {
        when(stockRepository.releaseProduct(10, 1)).thenReturn(0);

        assertFalse(warehouseStockService.releaseProduct(10, 1));
    }
}
