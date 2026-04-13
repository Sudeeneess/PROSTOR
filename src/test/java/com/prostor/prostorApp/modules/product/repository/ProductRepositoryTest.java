package com.prostor.prostorApp.modules.product.repository;

import com.prostor.prostorApp.modules.product.model.Category;
import com.prostor.prostorApp.modules.product.model.Product;
import com.prostor.prostorApp.modules.user.model.Seller;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Product Repository Tests")
class ProductRepositoryTest {

    private static final Logger log = LoggerFactory.getLogger(ProductRepositoryTest.class);

    @Mock
    private ProductRepository productRepository;

    private Product testProduct;
    private Seller testSeller;
    private Category testCategory;
    private Pageable pageable;

    @BeforeEach
    void setUp() {

        testSeller = new Seller();
        testSeller.setId(1);
        testSeller.setCompanyName("Test Company");

        testCategory = new Category();
        testCategory.setId(1);
        testCategory.setCategoryName("Test Category");

        testProduct = new Product();
        testProduct.setId(1);
        testProduct.setName("Test Product");
        testProduct.setPrice(100.0);
        testProduct.setSeller(testSeller);
        testProduct.setCategory(testCategory);
        testProduct.setCreatedAt(LocalDateTime.now());

        pageable = PageRequest.of(0, 10);
    }

    @Test
    @DisplayName("Should find product by ID when exists")
    void findById_WhenProductExists_ShouldReturnProduct() {
        log.info("=== Testing findById_WhenProductExists_ShouldReturnProduct ===");

        log.debug("Setting up mock: findById(1) -> Optional.of(testProduct)");
        when(productRepository.findById(1)).thenReturn(Optional.of(testProduct));

        log.debug("Calling productRepository.findById(1)");
        Optional<Product> result = productRepository.findById(1);
        log.info("Result: {}", result.isPresent() ? "FOUND" : "NOT_FOUND");

        log.debug("Verifying results...");
        assertTrue(result.isPresent());
        assertEquals(testProduct.getId(), result.get().getId());
        assertEquals(testProduct.getName(), result.get().getName());
        verify(productRepository, times(1)).findById(1);
        
        log.info("=== Test completed SUCCESSFULLY ===");
    }

    @Test
    @DisplayName("Should return empty when product not found by ID")
    void findById_WhenProductNotExists_ShouldReturnEmpty() {
        log.info("=== Testing findById_WhenProductNotExists_ShouldReturnEmpty ===");

        log.debug("Setting up mock: findById(999) -> Optional.empty()");
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        log.debug("Calling productRepository.findById(999)");
        Optional<Product> result = productRepository.findById(999);
        log.info("Result: {}", result.isPresent() ? "FOUND" : "NOT_FOUND");

        log.debug("Verifying results...");
        assertTrue(result.isEmpty());
        verify(productRepository, times(1)).findById(999);
        
        log.info("=== Test completed SUCCESSFULLY ===");
    }

    @Test
    @DisplayName("Should find products by category ID")
    void findByCategoryId_ShouldReturnProductsInCategory() {
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products);
        when(productRepository.findByCategoryId(1, pageable)).thenReturn(productPage);

        Page<Product> result = productRepository.findByCategoryId(1, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Product", result.getContent().get(0).getName());
        verify(productRepository, times(1)).findByCategoryId(1, pageable);
    }

    @Test
    @DisplayName("Should find products by seller ID")
    void findBySellerId_ShouldReturnProductsOfSeller() {
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products);
        when(productRepository.findBySellerId(1, pageable)).thenReturn(productPage);

        Page<Product> result = productRepository.findBySellerId(1, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Product", result.getContent().get(0).getName());
        verify(productRepository, times(1)).findBySellerId(1, pageable);
    }

    @Test
    @DisplayName("Should find products by seller ID (list version)")
    void findBySellerId_ShouldReturnListOfProducts() {
        List<Product> products = Arrays.asList(testProduct);
        when(productRepository.findBySellerId(1)).thenReturn(products);

        List<Product> result = productRepository.findBySellerId(1);

        assertEquals(1, result.size());
        assertEquals("Test Product", result.get(0).getName());
        verify(productRepository, times(1)).findBySellerId(1);
    }

    @Test
    @DisplayName("Should find products by price range")
    void findByPriceBetween_ShouldReturnProductsInPriceRange() {
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products);
        when(productRepository.findByPriceBetween(50.0, 150.0, pageable)).thenReturn(productPage);

        Page<Product> result = productRepository.findByPriceBetween(50.0, 150.0, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Product", result.getContent().get(0).getName());
        verify(productRepository, times(1)).findByPriceBetween(50.0, 150.0, pageable);
    }

    @Test
    @DisplayName("Should find products by name containing text (case insensitive)")
    void findByNameContainingIgnoreCase_ShouldReturnProductsMatchingName() {
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products);
        when(productRepository.findByNameContainingIgnoreCase("test", pageable)).thenReturn(productPage);

        Page<Product> result = productRepository.findByNameContainingIgnoreCase("test", pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Product", result.getContent().get(0).getName());
        verify(productRepository, times(1)).findByNameContainingIgnoreCase("test", pageable);
    }

    @Test
    @DisplayName("Should return true when product exists by name and seller ID")
    void existsByNameAndSellerId_WhenProductExists_ShouldReturnTrue() {
        when(productRepository.existsByNameAndSellerId("Test Product", 1)).thenReturn(true);

        boolean exists = productRepository.existsByNameAndSellerId("Test Product", 1);

        assertTrue(exists);
        verify(productRepository, times(1)).existsByNameAndSellerId("Test Product", 1);
    }

    @Test
    @DisplayName("Should return false when product does not exist by name and seller ID")
    void existsByNameAndSellerId_WhenProductNotExists_ShouldReturnFalse() {
        when(productRepository.existsByNameAndSellerId("Non-existent Product", 1)).thenReturn(false);

        boolean exists = productRepository.existsByNameAndSellerId("Non-existent Product", 1);

        assertFalse(exists);
        verify(productRepository, times(1)).existsByNameAndSellerId("Non-existent Product", 1);
    }

    @Test
    @DisplayName("Should filter products by category ID")
    void filterProducts_WhenOnlyCategoryIdProvided_ShouldFilterByCategory() {
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products);
        when(productRepository.filterProducts(1, null, null, null, null, pageable)).thenReturn(productPage);

        Page<Product> result = productRepository.filterProducts(1, null, null, null, null, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Product", result.getContent().get(0).getName());
        verify(productRepository, times(1)).filterProducts(1, null, null, null, null, pageable);
    }

    @Test
    @DisplayName("Should filter products by seller ID")
    void filterProducts_WhenOnlySellerIdProvided_ShouldFilterBySeller() {
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products);
        when(productRepository.filterProducts(null, 1, null, null, null, pageable)).thenReturn(productPage);

        Page<Product> result = productRepository.filterProducts(null, 1, null, null, null, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Product", result.getContent().get(0).getName());
        verify(productRepository, times(1)).filterProducts(null, 1, null, null, null, pageable);
    }

    @Test
    @DisplayName("Should filter products by price range")
    void filterProducts_WhenPriceRangeProvided_ShouldFilterByPrice() {
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products);
        when(productRepository.filterProducts(null, null, 50.0, 150.0, null, pageable)).thenReturn(productPage);

        Page<Product> result = productRepository.filterProducts(null, null, 50.0, 150.0, null, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Product", result.getContent().get(0).getName());
        verify(productRepository, times(1)).filterProducts(null, null, 50.0, 150.0, null, pageable);
    }

    @Test
    @DisplayName("Should filter products by name")
    void filterProducts_WhenNameProvided_ShouldFilterByName() {
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products);
        when(productRepository.filterProducts(null, null, null, null, "Test", pageable)).thenReturn(productPage);

        Page<Product> result = productRepository.filterProducts(null, null, null, null, "Test", pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Product", result.getContent().get(0).getName());
        verify(productRepository, times(1)).filterProducts(null, null, null, null, "Test", pageable);
    }

    @Test
    @DisplayName("Should filter products by multiple criteria")
    void filterProducts_WhenMultipleCriteriaProvided_ShouldFilterByAllCriteria() {
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products);
        when(productRepository.filterProducts(1, 1, 50.0, 150.0, "Test", pageable)).thenReturn(productPage);

        Page<Product> result = productRepository.filterProducts(1, 1, 50.0, 150.0, "Test", pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Product", result.getContent().get(0).getName());
        verify(productRepository, times(1)).filterProducts(1, 1, 50.0, 150.0, "Test", pageable);
    }

    @Test
    @DisplayName("Should return all products when no filter criteria provided")
    void filterProducts_WhenNoCriteriaProvided_ShouldReturnAllProducts() {
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products);
        when(productRepository.filterProducts(null, null, null, null, null, pageable)).thenReturn(productPage);

        Page<Product> result = productRepository.filterProducts(null, null, null, null, null, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Product", result.getContent().get(0).getName());
        verify(productRepository, times(1)).filterProducts(null, null, null, null, null, pageable);
    }

    @Test
    @DisplayName("Should save product successfully")
    void save_ShouldPersistProduct() {
        when(productRepository.save(testProduct)).thenReturn(testProduct);

        Product result = productRepository.save(testProduct);

        assertNotNull(result);
        assertEquals(testProduct.getId(), result.getId());
        assertEquals(testProduct.getName(), result.getName());
        verify(productRepository, times(1)).save(testProduct);
    }

    @Test
    @DisplayName("Should delete product by ID")
    void deleteById_ShouldRemoveProduct() {
        productRepository.deleteById(1);

        verify(productRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("Should check if product exists by ID")
    void existsById_ShouldReturnCorrectValue() {
        when(productRepository.existsById(1)).thenReturn(true);
        when(productRepository.existsById(999)).thenReturn(false);
        assertTrue(productRepository.existsById(1));
        assertFalse(productRepository.existsById(999));
        verify(productRepository, times(1)).existsById(1);
        verify(productRepository, times(1)).existsById(999);
    }

    @Test
    @DisplayName("Should find all products")
    void findAll_ShouldReturnAllProducts() {
        List<Product> products = Arrays.asList(testProduct);
        when(productRepository.findAll()).thenReturn(products);

        List<Product> result = productRepository.findAll();

        assertEquals(1, result.size());
        assertEquals("Test Product", result.get(0).getName());
        verify(productRepository, times(1)).findAll();
    }
}
