package com.prostor.prostorApp.modules.product.service;

import com.prostor.prostorApp.modules.product.dto.ProductRequest;
import com.prostor.prostorApp.modules.product.dto.ProductResponse;
import com.prostor.prostorApp.modules.product.model.Category;
import com.prostor.prostorApp.modules.product.model.Product;
import com.prostor.prostorApp.modules.product.repository.CategoryRepository;
import com.prostor.prostorApp.modules.product.repository.ProductRepository;
import com.prostor.prostorApp.modules.user.model.Seller;
import com.prostor.prostorApp.modules.user.repository.SellerRepository;
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
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Product Service Tests")
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private SellerRepository sellerRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;
    private ProductRequest testProductRequest;
    private Seller testSeller;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        testSeller = new Seller();
        testSeller.setId(1);
        testSeller.setCompanyName("Test seller");

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

        testProductRequest = new ProductRequest();
        testProductRequest.setName("Test Product");
        testProductRequest.setPrice(100.0);
        testProductRequest.setSellerId(1);
        testProductRequest.setCategoryId(1);
    }

    @Test
    @DisplayName("Should return product when found by ID")
    void getById_WhenProductExists_ShouldReturnProductResponse() {
        when(productRepository.findById(1)).thenReturn(Optional.of(testProduct));

        ProductResponse result = productService.getById(1);

        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals("Test Product", result.getName());
        assertEquals(100.0, result.getPrice());
        assertEquals(1, result.getSellerId());
        assertEquals(1, result.getCategoryId());
        verify(productRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when product not found by ID")
    void getById_WhenProductNotExists_ShouldThrowEntityNotFoundException() {
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> productService.getById(999)
        );

        assertEquals("Product not found with id: 999", exception.getMessage());
        verify(productRepository, times(1)).findById(999);
    }

    @Test
    @DisplayName("Should create product successfully when valid data provided")
    void create_WhenValidDataProvided_ShouldCreateAndReturnProductResponse() {
        when(sellerRepository.findById(1)).thenReturn(Optional.of(testSeller));
        when(categoryRepository.findById(1)).thenReturn(Optional.of(testCategory));
        when(productRepository.existsByNameAndSellerId("Test Product", 1)).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        ProductResponse result = productService.create(testProductRequest);

        assertNotNull(result);
        assertEquals("Test Product", result.getName());
        assertEquals(100.0, result.getPrice());
        assertEquals(1, result.getSellerId());
        assertEquals(1, result.getCategoryId());

        verify(sellerRepository, times(1)).findById(1);
        verify(categoryRepository, times(1)).findById(1);
        verify(productRepository, times(1)).existsByNameAndSellerId("Test Product", 1);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when seller not found during creation")
    void create_WhenSellerNotExists_ShouldThrowEntityNotFoundException() {
        when(sellerRepository.findById(1)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> productService.create(testProductRequest)
        );

        assertEquals("Seller not found with id: 1", exception.getMessage());
        verify(sellerRepository, times(1)).findById(1);
        verify(categoryRepository, never()).findById(anyInt());
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when category not found during creation")
    void create_WhenCategoryNotExists_ShouldThrowEntityNotFoundException() {
        when(sellerRepository.findById(1)).thenReturn(Optional.of(testSeller));
        when(categoryRepository.findById(1)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> productService.create(testProductRequest)
        );

        assertEquals("Category not found with id: 1", exception.getMessage());
        verify(sellerRepository, times(1)).findById(1);
        verify(categoryRepository, times(1)).findById(1);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when product name already exists for seller")
    void create_WhenProductNameAlreadyExistsForSeller_ShouldThrowIllegalArgumentException() {
        when(sellerRepository.findById(1)).thenReturn(Optional.of(testSeller));
        when(categoryRepository.findById(1)).thenReturn(Optional.of(testCategory));
        when(productRepository.existsByNameAndSellerId("Test Product", 1)).thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> productService.create(testProductRequest)
        );

        assertEquals("Product with name 'Test Product' already exists for this seller", exception.getMessage());
        verify(sellerRepository, times(1)).findById(1);
        verify(categoryRepository, times(1)).findById(1);
        verify(productRepository, times(1)).existsByNameAndSellerId("Test Product", 1);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("Should update product successfully when valid data provided")
    void update_WhenValidDataProvided_ShouldUpdateAndReturnProductResponse() {
        ProductRequest updateRequest = new ProductRequest();
        updateRequest.setName("Updated Product");
        updateRequest.setPrice(150.0);
        updateRequest.setSellerId(1);
        updateRequest.setCategoryId(1);

        when(productRepository.findById(1)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        ProductResponse result = productService.update(1, updateRequest);

        assertNotNull(result);
        verify(productRepository, times(1)).findById(1);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when product not found during update")
    void update_WhenProductNotExists_ShouldThrowEntityNotFoundException() {
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> productService.update(999, testProductRequest)
        );

        assertEquals("Product not found with id: 999", exception.getMessage());
        verify(productRepository, times(1)).findById(999);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("Should delete product successfully when product exists")
    void delete_WhenProductExists_ShouldDeleteProduct() {
        when(productRepository.existsById(1)).thenReturn(true);

        assertDoesNotThrow(() -> productService.delete(1));

        verify(productRepository, times(1)).existsById(1);
        verify(productRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when product not found during deletion")
    void delete_WhenProductNotExists_ShouldThrowEntityNotFoundException() {
        when(productRepository.existsById(999)).thenReturn(false);

        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> productService.delete(999)
        );

        assertEquals("Product not found with id: 999", exception.getMessage());
        verify(productRepository, times(1)).existsById(999);
        verify(productRepository, never()).deleteById(anyInt());
    }

    @Test
    @DisplayName("Should return all products with pagination")
    void getAll_ShouldReturnAllProductsWithPagination() {
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products);
        Pageable pageable = mock(Pageable.class);

        when(productRepository.findAll(pageable)).thenReturn(productPage);

        Page<ProductResponse> result = productService.getAll(pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Test Product", result.getContent().get(0).getName());
        verify(productRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("Should return products filtered by seller")
    void getProductsBySeller_ShouldReturnProductsForSpecificSeller() {
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products);
        Pageable pageable = mock(Pageable.class);

        when(productRepository.findBySellerId(1, pageable)).thenReturn(productPage);

        Page<ProductResponse> result = productService.getProductsBySeller(1, pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Test Product", result.getContent().get(0).getName());
        verify(productRepository, times(1)).findBySellerId(1, pageable);
    }

    @Test
    @DisplayName("Should return filtered products based on criteria")
    void filter_ShouldReturnFilteredProducts() {
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products);
        Pageable pageable = mock(Pageable.class);

        when(productRepository.filterProducts(eq(1), eq(1), isNull(), isNull(), isNull(), eq(pageable)))
                .thenReturn(productPage);

        Page<ProductResponse> result = productService.filter(1, 1, null, null, null, pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(productRepository, times(1))
                .filterProducts(eq(1), eq(1), isNull(), isNull(), isNull(), eq(pageable));
    }
}
