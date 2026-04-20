package com.prostor.prostorApp.modules.productCard.service;

import com.prostor.prostorApp.modules.product.dto.ProductCardRequest;
import com.prostor.prostorApp.modules.product.dto.ProductCardResponse;
import com.prostor.prostorApp.modules.product.model.Brand;
import com.prostor.prostorApp.modules.product.model.Category;
import com.prostor.prostorApp.modules.product.model.Product;
import com.prostor.prostorApp.modules.product.model.ProductCard;
import com.prostor.prostorApp.modules.product.model.Size;
import com.prostor.prostorApp.modules.product.repository.BrandRepository;
import com.prostor.prostorApp.modules.product.repository.ProductCardRepository;
import com.prostor.prostorApp.modules.product.repository.ProductRepository;
import com.prostor.prostorApp.modules.product.repository.SizeRepository;
import com.prostor.prostorApp.modules.product.service.ProductCardService;
import com.prostor.prostorApp.modules.user.model.Seller;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductCard Service Tests")
class ProductCardServiceTest {

    @Mock
    private ProductCardRepository productCardRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private BrandRepository brandRepository;
    @Mock
    private SizeRepository sizeRepository;

    @InjectMocks
    private ProductCardService productCardService;

    private Product product;
    private Brand brand;
    private Size size;
    private ProductCard card;

    @BeforeEach
    void setUp() {
        Category category = new Category();
        category.setId(1);
        category.setCategoryName("Cat");

        Seller seller = new Seller();
        seller.setId(1);

        product = new Product();
        product.setId(10);
        product.setName("P1");
        product.setPrice(1.0);
        product.setSeller(seller);
        product.setCategory(category);

        brand = new Brand();
        brand.setId(20);
        brand.setName("B1");

        size = new Size();
        size.setId(30);
        size.setName("M");

        card = new ProductCard();
        card.setId(100);
        card.setProduct(product);
        card.setDescription("Desc");
        card.setType("type-a");
        card.setPhoto(Collections.emptyList());
        card.setIsActive(true);
    }

    @Test
    @DisplayName("Should return cards for product id")
    void getByProductId_ShouldReturnList() {
        when(productRepository.findPublicById(10)).thenReturn(Optional.of(product));
        when(productCardRepository.findByProductId(10)).thenReturn(List.of(card));

        List<ProductCardResponse> result = productCardService.getByProductId(10);

        assertEquals(1, result.size());
        assertEquals(100, result.get(0).getId());
        assertEquals(10, result.get(0).getProductId());
        verify(productCardRepository).findByProductId(10);
    }

    @Test
    @DisplayName("Should return card when found by id")
    void getById_WhenExists_ShouldReturnResponse() {
        when(productCardRepository.findById(100)).thenReturn(Optional.of(card));
        when(productRepository.findPublicById(10)).thenReturn(Optional.of(product));

        ProductCardResponse result = productCardService.getById(100);

        assertEquals(100, result.getId());
        assertEquals("Desc", result.getDescription());
        verify(productCardRepository).findById(100);
    }

    @Test
    @DisplayName("Should throw when card not found by id")
    void getById_WhenMissing_ShouldThrow() {
        when(productCardRepository.findById(1)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> productCardService.getById(1));

        assertTrue(ex.getMessage().contains("ProductCard not found"));
    }

    @Test
    @DisplayName("Should hide card when product is not public")
    void getById_WhenProductPending_ShouldThrow() {
        when(productCardRepository.findById(100)).thenReturn(Optional.of(card));
        when(productRepository.findPublicById(10)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> productCardService.getById(100));
    }

    @Test
    @DisplayName("Should create card with product only")
    void create_WithProductOnly_ShouldSave() {
        ProductCardRequest req = baseRequest();
        when(productRepository.findById(10)).thenReturn(Optional.of(product));
        when(productCardRepository.save(any(ProductCard.class))).thenAnswer(invocation -> {
            ProductCard c = invocation.getArgument(0);
            c.setId(200);
            return c;
        });

        ProductCardResponse result = productCardService.create(req);

        assertEquals(200, result.getId());
        assertEquals(10, result.getProductId());
        verify(brandRepository, never()).findById(anyInt());
        verify(sizeRepository, never()).findById(anyInt());
        verify(productCardRepository).save(any(ProductCard.class));
    }

    @Test
    @DisplayName("Should create card with brand and size")
    void create_WithBrandAndSize_ShouldSave() {
        ProductCardRequest req = baseRequest();
        req.setBrandId(20);
        req.setSizeId(30);
        when(productRepository.findById(10)).thenReturn(Optional.of(product));
        when(brandRepository.findById(20)).thenReturn(Optional.of(brand));
        when(sizeRepository.findById(30)).thenReturn(Optional.of(size));
        when(productCardRepository.save(any(ProductCard.class))).thenAnswer(invocation -> {
            ProductCard c = invocation.getArgument(0);
            c.setId(201);
            return c;
        });

        ProductCardResponse result = productCardService.create(req);

        assertEquals(201, result.getId());
        assertNotNull(result.getBrand());
        assertEquals(20, result.getBrand().getId());
        assertNotNull(result.getSize());
        assertEquals(30, result.getSize().getId());
    }

    @Test
    @DisplayName("Should throw when product missing on create")
    void create_WhenProductMissing_ShouldThrow() {
        ProductCardRequest req = baseRequest();
        when(productRepository.findById(10)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> productCardService.create(req));
        verify(productCardRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw when brand missing on create")
    void create_WhenBrandMissing_ShouldThrow() {
        ProductCardRequest req = baseRequest();
        req.setBrandId(20);
        when(productRepository.findById(10)).thenReturn(Optional.of(product));
        when(brandRepository.findById(20)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> productCardService.create(req));
        verify(productCardRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw when size missing on create")
    void create_WhenSizeMissing_ShouldThrow() {
        ProductCardRequest req = baseRequest();
        req.setSizeId(30);
        when(productRepository.findById(10)).thenReturn(Optional.of(product));
        when(sizeRepository.findById(30)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> productCardService.create(req));
        verify(productCardRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should update card fields and relations")
    void update_WhenValid_ShouldReturnUpdated() {
        ProductCardRequest req = baseRequest();
        req.setDescription("New");
        req.setType("type-b");
        req.setBrandId(20);
        req.setSizeId(30);

        card.setBrand(null);
        card.setSize(null);

        when(productCardRepository.findById(100)).thenReturn(Optional.of(card));
        when(brandRepository.findById(20)).thenReturn(Optional.of(brand));
        when(sizeRepository.findById(30)).thenReturn(Optional.of(size));
        when(productCardRepository.save(any(ProductCard.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductCardResponse result = productCardService.update(100, req);

        assertEquals("New", result.getDescription());
        assertEquals("type-b", result.getType());
        verify(productCardRepository).save(any(ProductCard.class));
    }

    @Test
    @DisplayName("Should throw when updating missing card")
    void update_WhenCardMissing_ShouldThrow() {
        when(productCardRepository.findById(100)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> productCardService.update(100, baseRequest()));
        verify(productCardRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw when new product id not found on update")
    void update_WhenNewProductMissing_ShouldThrow() {
        Product other = new Product();
        other.setId(99);
        other.setName("Other");
        ProductCardRequest req = baseRequest();
        req.setProductId(99);

        when(productCardRepository.findById(100)).thenReturn(Optional.of(card));
        when(productRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> productCardService.update(100, req));
        verify(productCardRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should clear brand when brandId null on update")
    void update_WhenBrandIdNull_ShouldClearBrand() {
        card.setBrand(brand);
        ProductCardRequest req = baseRequest();
        req.setBrandId(null);

        when(productCardRepository.findById(100)).thenReturn(Optional.of(card));
        when(productCardRepository.save(any(ProductCard.class))).thenAnswer(inv -> inv.getArgument(0));

        productCardService.update(100, req);

        assertNull(card.getBrand());
        verify(brandRepository, never()).findById(anyInt());
    }

    @Test
    @DisplayName("Should clear size when sizeId null on update")
    void update_WhenSizeIdNull_ShouldClearSize() {
        card.setSize(size);
        ProductCardRequest req = baseRequest();
        req.setSizeId(null);

        when(productCardRepository.findById(100)).thenReturn(Optional.of(card));
        when(productCardRepository.save(any(ProductCard.class))).thenAnswer(inv -> inv.getArgument(0));

        productCardService.update(100, req);

        assertNull(card.getSize());
        verify(sizeRepository, never()).findById(anyInt());
    }

    @Test
    @DisplayName("Should delete when card exists")
    void delete_WhenExists_ShouldDelete() {
        when(productCardRepository.existsById(100)).thenReturn(true);

        productCardService.delete(100);

        verify(productCardRepository).deleteById(100);
    }

    @Test
    @DisplayName("Should throw when deleting missing card")
    void delete_WhenMissing_ShouldThrow() {
        when(productCardRepository.existsById(100)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> productCardService.delete(100));
        verify(productCardRepository, never()).deleteById(anyInt());
    }

    private static ProductCardRequest baseRequest() {
        ProductCardRequest r = new ProductCardRequest();
        r.setProductId(10);
        r.setDescription("Desc");
        r.setType("type-a");
        r.setPhoto(Collections.emptyList());
        r.setIsActive(true);
        return r;
    }
}
