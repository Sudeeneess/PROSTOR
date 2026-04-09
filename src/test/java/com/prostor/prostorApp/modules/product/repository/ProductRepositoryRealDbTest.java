package com.prostor.prostorApp.modules.product.repository;

import com.prostor.prostorApp.modules.product.model.Category;
import com.prostor.prostorApp.modules.product.model.Product;
import com.prostor.prostorApp.modules.user.model.Role;
import com.prostor.prostorApp.modules.user.model.Seller;
import com.prostor.prostorApp.modules.user.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("realdb")
@DisplayName("Product Repository Tests (Real PostgreSQL)")
class ProductRepositoryRealDbTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ProductRepository productRepository;

    private Role testRole;
    private User testUser;
    private Seller testSeller;
    private Category testCategory;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        testRole = new Role();
        testRole.setName("SELLER");
        entityManager.persistAndFlush(testRole);

        testUser = new User();
        testUser.setUserName("testuser");
        testUser.setPasswordHash("hashedpassword");
        testUser.setRole(testRole);
        testUser.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(testUser);

        testSeller = new Seller();
        testSeller.setUser(testUser);
        testSeller.setInn("123456789012");
        testSeller.setCompanyName("Test Company");
        entityManager.persistAndFlush(testSeller);

        testCategory = new Category();
        testCategory.setCategoryName("Test Category");
        entityManager.persistAndFlush(testCategory);

        testProduct = new Product();
        testProduct.setName("Test Product");
        testProduct.setPrice(100.0);
        testProduct.setSeller(testSeller);
        testProduct.setCategory(testCategory);
        testProduct.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(testProduct);
    }

    @Test
    @DisplayName("Should find product by ID when exists")
    void findById_WhenProductExists_ShouldReturnProduct() {
        Optional<Product> found = productRepository.findById(testProduct.getId());

        assertTrue(found.isPresent());
        assertEquals(testProduct.getId(), found.get().getId());
        assertEquals(testProduct.getName(), found.get().getName());
        assertEquals(testProduct.getPrice(), found.get().getPrice());
    }

    @Test
    @DisplayName("Should return empty when product not found by ID")
    void findById_WhenProductNotExists_ShouldReturnEmpty() {
        var result = productRepository.findById(999);

        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Should find products by category ID")
    void findByCategoryId_ShouldReturnProductsInCategory() {
        Product anotherProduct = new Product();
        anotherProduct.setName("Another Product");
        anotherProduct.setPrice(200.0);
        anotherProduct.setSeller(testSeller);
        anotherProduct.setCategory(testCategory);
        anotherProduct.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(anotherProduct);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.findByCategoryId(testCategory.getId(), pageable);

        assertEquals(2, result.getTotalElements());
        assertTrue(result.getContent().stream()
                .anyMatch(p -> p.getName().equals("Test Product")));
        assertTrue(result.getContent().stream()
                .anyMatch(p -> p.getName().equals("Another Product")));
    }

    @Test
    @DisplayName("Should find products by seller ID")
    void findBySellerId_ShouldReturnProductsOfSeller() {
        Product anotherProduct = new Product();
        anotherProduct.setName("Another Product");
        anotherProduct.setPrice(200.0);
        anotherProduct.setSeller(testSeller);
        anotherProduct.setCategory(testCategory);
        anotherProduct.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(anotherProduct);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.findBySellerId(testSeller.getId(), pageable);

        assertEquals(2, result.getTotalElements());
        assertTrue(result.getContent().stream()
                .allMatch(p -> p.getSeller().getId().equals(testSeller.getId())));
    }

    @Test
    @DisplayName("Should find products by seller ID (list version)")
    void findBySellerId_ShouldReturnListOfProducts() {
        Product anotherProduct = new Product();
        anotherProduct.setName("Another Product");
        anotherProduct.setPrice(200.0);
        anotherProduct.setSeller(testSeller);
        anotherProduct.setCategory(testCategory);
        anotherProduct.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(anotherProduct);

        List<Product> result = productRepository.findBySellerId(testSeller.getId());

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(p -> p.getSeller().getId().equals(testSeller.getId())));
    }

    @Test
    @DisplayName("Should find products by price range")
    void findByPriceBetween_ShouldReturnProductsInPriceRange() {
        Product cheapProduct = new Product();
        cheapProduct.setName("Cheap Product");
        cheapProduct.setPrice(50.0);
        cheapProduct.setSeller(testSeller);
        cheapProduct.setCategory(testCategory);
        cheapProduct.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(cheapProduct);

        Product expensiveProduct = new Product();
        expensiveProduct.setName("Expensive Product");
        expensiveProduct.setPrice(200.0);
        expensiveProduct.setSeller(testSeller);
        expensiveProduct.setCategory(testCategory);
        expensiveProduct.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(expensiveProduct);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.findByPriceBetween(75.0, 150.0, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Product", result.getContent().get(0).getName());
    }

    @Test
    @DisplayName("Should find products by name containing text (case insensitive)")
    void findByNameContainingIgnoreCase_ShouldReturnProductsMatchingName() {
        Product upperCaseProduct = new Product();
        upperCaseProduct.setName("TEST PRODUCT UPPERCASE");
        upperCaseProduct.setPrice(300.0);
        upperCaseProduct.setSeller(testSeller);
        upperCaseProduct.setCategory(testCategory);
        upperCaseProduct.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(upperCaseProduct);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.findByNameContainingIgnoreCase("test", pageable);

        assertEquals(2, result.getTotalElements());
        assertTrue(result.getContent().stream()
                .anyMatch(p -> p.getName().equals("Test Product")));
        assertTrue(result.getContent().stream()
                .anyMatch(p -> p.getName().equals("TEST PRODUCT UPPERCASE")));
    }

    @Test
    @DisplayName("Should return true when product exists by name and seller ID")
    void existsByNameAndSellerId_WhenProductExists_ShouldReturnTrue() {
        boolean exists = productRepository.existsByNameAndSellerId(
                testProduct.getName(), testSeller.getId());

        assertTrue(exists);
    }

    @Test
    @DisplayName("Should return false when product does not exist by name and seller ID")
    void existsByNameAndSellerId_WhenProductNotExists_ShouldReturnFalse() {
        boolean exists = productRepository.existsByNameAndSellerId(
                "Non-existent Product", testSeller.getId());

        assertFalse(exists);
    }

    @Test
    @DisplayName("Should filter products by category ID")
    void filterProducts_WhenOnlyCategoryIdProvided_ShouldFilterByCategory() {
        Category anotherCategory = new Category();
        anotherCategory.setCategoryName("Another Category");
        entityManager.persistAndFlush(anotherCategory);

        Product productInAnotherCategory = new Product();
        productInAnotherCategory.setName("Product in Another Category");
        productInAnotherCategory.setPrice(150.0);
        productInAnotherCategory.setSeller(testSeller);
        productInAnotherCategory.setCategory(anotherCategory);
        productInAnotherCategory.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(productInAnotherCategory);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.filterProducts(
                testCategory.getId(), null, null, null, null, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Product", result.getContent().get(0).getName());
    }

    @Test
    @DisplayName("Should filter products by seller ID")
    void filterProducts_WhenOnlySellerIdProvided_ShouldFilterBySeller() {
        Role anotherRole = new Role();
        anotherRole.setName("ANOTHER_SELLER");
        entityManager.persistAndFlush(anotherRole);

        User anotherUser = new User();
        anotherUser.setUserName("anotheruser");
        anotherUser.setPasswordHash("hashedpassword");
        anotherUser.setRole(anotherRole);
        anotherUser.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(anotherUser);

        Seller anotherSeller = new Seller();
        anotherSeller.setUser(anotherUser);
        anotherSeller.setInn("987654321098");
        anotherSeller.setCompanyName("Another Company");
        entityManager.persistAndFlush(anotherSeller);

        Product productOfAnotherSeller = new Product();
        productOfAnotherSeller.setName("Product of Another Seller");
        productOfAnotherSeller.setPrice(250.0);
        productOfAnotherSeller.setSeller(anotherSeller);
        productOfAnotherSeller.setCategory(testCategory);
        productOfAnotherSeller.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(productOfAnotherSeller);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.filterProducts(
                null, testSeller.getId(), null, null, null, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Product", result.getContent().get(0).getName());
    }

    @Test
    @DisplayName("Should filter products by price range")
    void filterProducts_WhenPriceRangeProvided_ShouldFilterByPrice() {
        Product cheapProduct = new Product();
        cheapProduct.setName("Cheap Product");
        cheapProduct.setPrice(50.0);
        cheapProduct.setSeller(testSeller);
        cheapProduct.setCategory(testCategory);
        cheapProduct.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(cheapProduct);

        Product expensiveProduct = new Product();
        expensiveProduct.setName("Expensive Product");
        expensiveProduct.setPrice(200.0);
        expensiveProduct.setSeller(testSeller);
        expensiveProduct.setCategory(testCategory);
        expensiveProduct.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(expensiveProduct);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.filterProducts(
                null, null, 75.0, 150.0, null, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Product", result.getContent().get(0).getName());
    }

    @Test
    @DisplayName("Should filter products by name")
    void filterProducts_WhenNameProvided_ShouldFilterByName() {
        Product differentProduct = new Product();
        differentProduct.setName("Different Product");
        differentProduct.setPrice(300.0);
        differentProduct.setSeller(testSeller);
        differentProduct.setCategory(testCategory);
        differentProduct.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(differentProduct);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.filterProducts(
                null, null, null, null, "Test", pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Product", result.getContent().get(0).getName());
    }

    @Test
    @DisplayName("Should filter products by multiple criteria")
    void filterProducts_WhenMultipleCriteriaProvided_ShouldFilterByAllCriteria() {
        Product cheapProduct = new Product();
        cheapProduct.setName("Cheap Test Product");
        cheapProduct.setPrice(50.0);
        cheapProduct.setSeller(testSeller);
        cheapProduct.setCategory(testCategory);
        cheapProduct.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(cheapProduct);

        Category anotherCategory = new Category();
        anotherCategory.setCategoryName("Another Category");
        entityManager.persistAndFlush(anotherCategory);

        Product productInAnotherCategory = new Product();
        productInAnotherCategory.setName("Test Product in Another Category");
        productInAnotherCategory.setPrice(120.0);
        productInAnotherCategory.setSeller(testSeller);
        productInAnotherCategory.setCategory(anotherCategory);
        productInAnotherCategory.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(productInAnotherCategory);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.filterProducts(
                testCategory.getId(), testSeller.getId(), 75.0, 150.0, "Test", pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Product", result.getContent().get(0).getName());
    }

    @Test
    @DisplayName("Should return all products when no filter criteria provided")
    void filterProducts_WhenNoCriteriaProvided_ShouldReturnAllProducts() {
        Product anotherProduct = new Product();
        anotherProduct.setName("Another Product");
        anotherProduct.setPrice(200.0);
        anotherProduct.setSeller(testSeller);
        anotherProduct.setCategory(testCategory);
        anotherProduct.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(anotherProduct);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.filterProducts(
                null, null, null, null, null, pageable);

        assertEquals(2, result.getTotalElements());
    }

    @Test
    @DisplayName("Should paginate results correctly")
    void filterProducts_WithPagination_ShouldReturnCorrectPage() {
        for (int i = 0; i < 5; i++) {
            Product product = new Product();
            product.setName("Product " + i);
            product.setPrice(100.0 + i);
            product.setSeller(testSeller);
            product.setCategory(testCategory);
            product.setCreatedAt(LocalDateTime.now());
            entityManager.persistAndFlush(product);
        }

        Pageable pageable = PageRequest.of(0, 2);
        Page<Product> result = productRepository.filterProducts(
                null, null, null, null, null, pageable);

        assertEquals(6, result.getTotalElements()); // 5 new + 1 original
        assertEquals(2, result.getContent().size());
        assertEquals(0, result.getNumber()); // page number
        assertEquals(3, result.getTotalPages()); // ceil(6/2) = 3
    }

    @Test
    @DisplayName("Should sort filtered products by name ascending")
    void filterProducts_WithSortByNameAsc_ShouldOrderByName() {
        Product zebra = new Product();
        zebra.setName("Zebra Product");
        zebra.setPrice(50.0);
        zebra.setSeller(testSeller);
        zebra.setCategory(testCategory);
        zebra.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(zebra);

        Product alpha = new Product();
        alpha.setName("Alpha Product");
        alpha.setPrice(60.0);
        alpha.setSeller(testSeller);
        alpha.setCategory(testCategory);
        alpha.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(alpha);

        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.ASC, "name"));
        Page<Product> result = productRepository.filterProducts(
                null, null, null, null, null, pageable);

        assertEquals(3, result.getTotalElements());
        assertEquals("Alpha Product", result.getContent().get(0).getName());
        assertEquals("Test Product", result.getContent().get(1).getName());
        assertEquals("Zebra Product", result.getContent().get(2).getName());
    }
}
