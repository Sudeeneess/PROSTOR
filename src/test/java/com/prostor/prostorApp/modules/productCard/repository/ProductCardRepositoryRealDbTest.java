package com.prostor.prostorApp.modules.productCard.repository;

import com.prostor.prostorApp.modules.product.model.Brand;
import com.prostor.prostorApp.modules.product.model.Category;
import com.prostor.prostorApp.modules.product.model.Product;
import com.prostor.prostorApp.modules.product.model.ProductCard;
import com.prostor.prostorApp.modules.product.repository.ProductCardRepository;
import com.prostor.prostorApp.modules.user.model.Role;
import com.prostor.prostorApp.modules.user.model.Seller;
import com.prostor.prostorApp.modules.user.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("ProductCard Repository Tests (PostgreSQL)")
class ProductCardRepositoryRealDbTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ProductCardRepository productCardRepository;

    private Product product;
    private Brand brand;

    @BeforeEach
    void setUp() {
        Role role = new Role();
        role.setName("SELLER_PC_" + System.nanoTime());
        entityManager.persistAndFlush(role);

        User user = new User();
        long n = System.nanoTime();
        user.setUserName("pc_u_" + n);
        user.setPasswordHash("hash");
        user.setContactPhone(String.format("%011d", n % 100_000_000_000L));
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(user);

        Seller seller = new Seller();
        seller.setUser(user);
        seller.setInn(String.format("%012d", System.nanoTime() % 1_000_000_000_000L));
        seller.setCompanyName("PC Test Co");
        entityManager.persistAndFlush(seller);

        Category category = new Category();
        category.setCategoryName("PC Cat " + System.nanoTime());
        entityManager.persistAndFlush(category);

        product = new Product();
        product.setName("PC Product");
        product.setPrice(100.0);
        product.setSeller(seller);
        product.setCategory(category);
        product.setCreatedAt(LocalDateTime.now());
        entityManager.persistAndFlush(product);

        brand = new Brand();
        brand.setName("PC Brand " + System.nanoTime());
        entityManager.persistAndFlush(brand);
    }

    @Test
    @DisplayName("Should find cards by product id")
    void findByProductId_ShouldReturnCards() {
        ProductCard card = newCard(true);
        entityManager.persistAndFlush(card);

        List<ProductCard> found = productCardRepository.findByProductId(product.getId());

        assertEquals(1, found.size());
        assertEquals(card.getId(), found.get(0).getId());
        assertEquals("Desc", found.get(0).getDescription());
    }

    @Test
    @DisplayName("Should find cards by brand id")
    void findByBrandId_ShouldReturnCards() {
        ProductCard card = newCard(true);
        card.setBrand(brand);
        entityManager.persistAndFlush(card);

        List<ProductCard> found = productCardRepository.findByBrandId(brand.getId());

        assertEquals(1, found.size());
        assertEquals(brand.getId(), found.get(0).getBrand().getId());
    }

    @Test
    @DisplayName("Should return only active cards from findByIsActiveTrue")
    void findByIsActiveTrue_ShouldFilter() {
        ProductCard active = newCard(true);
        entityManager.persistAndFlush(active);

        ProductCard inactive = newCard(false);
        entityManager.persistAndFlush(inactive);

        List<ProductCard> found = productCardRepository.findByIsActiveTrue();

        assertTrue(found.stream().anyMatch(c -> c.getId().equals(active.getId())));
        assertTrue(found.stream().noneMatch(c -> c.getId().equals(inactive.getId())));
    }

    private ProductCard newCard(boolean active) {
        ProductCard card = new ProductCard();
        card.setProduct(product);
        card.setDescription("Desc");
        card.setType("type-x");
        card.setPhoto(Collections.emptyList());
        card.setIsActive(active);
        return card;
    }
}
