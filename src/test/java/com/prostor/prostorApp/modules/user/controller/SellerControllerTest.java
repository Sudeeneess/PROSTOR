package com.prostor.prostorApp.modules.user.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prostor.prostorApp.common.exception.ErrorResponse;
import com.prostor.prostorApp.common.exception.GlobalExceptionHandler;
import com.prostor.prostorApp.modules.product.dto.ProductRequest;
import com.prostor.prostorApp.modules.product.dto.ProductResponse;
import com.prostor.prostorApp.modules.product.service.ProductService;
import com.prostor.prostorApp.modules.user.model.Seller;
import com.prostor.prostorApp.modules.user.model.User;
import com.prostor.prostorApp.modules.user.repository.SellerRepository;
import com.prostor.prostorApp.modules.user.repository.UserRepository;
import com.prostor.prostorApp.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.data.web.SpringDataWebAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = SellerController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class,
                UserDetailsServiceAutoConfiguration.class
        },
        properties = "spring.autoconfigure.exclude=org.springframework.boot.test.autoconfigure.web.servlet.MockMvcSecurityConfiguration"
)
@AutoConfigureMockMvc(addFilters = false)
@Import({
        GlobalExceptionHandler.class,
        SpringDataWebAutoConfiguration.class,
        UserWebMvcTestSecurityConfig.class
})
@DisplayName("SellerController")
class SellerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private SellerRepository sellerRepository;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/seller/products returns page for seller")
    void getMyProducts_ok() throws Exception {
        stubSellerPrincipal("seller_pro", 5, 99);
        ProductResponse row = sampleProduct(1, 99);
        Page<ProductResponse> page = new PageImpl<>(List.of(row), PageRequest.of(0, 20), 1);
        when(productService.getProductsBySeller(eq(99), any(Pageable.class))).thenReturn(page);

        String json = mockMvc.perform(get("/api/seller/products").with(user("seller_pro").roles("SELLER")))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode root = objectMapper.readTree(json);
        assertEquals(1, root.get("totalElements").asInt());
        verify(productService).getProductsBySeller(eq(99), any(Pageable.class));
    }

    @Test
    @DisplayName("GET /api/seller/products/{id} returns product when owned by seller")
    void getProductById_ok() throws Exception {
        stubSellerPrincipal("seller_pro", 5, 99);
        when(productService.getById(7)).thenReturn(sampleProduct(7, 99));

        String json = mockMvc.perform(get("/api/seller/products/7").with(user("seller_pro").roles("SELLER")))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertEquals(7, objectMapper.readValue(json, ProductResponse.class).getId().intValue());
    }

    @Test
    @DisplayName("GET /api/seller/products/{id} returns 403 when product belongs to another seller")
    void getProductById_forbidden() throws Exception {
        stubSellerPrincipal("seller_pro", 5, 99);
        when(productService.getById(7)).thenReturn(sampleProduct(7, 1));

        String json = mockMvc.perform(get("/api/seller/products/7").with(user("seller_pro").roles("SELLER")))
                .andExpect(status().isForbidden())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse err = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(403, err.getStatus());
    }

    @Test
    @DisplayName("GET /api/seller/products/{id} returns 404 when user has no seller profile")
    void getProductById_noSeller() throws Exception {
        User u = new User();
        u.setId(5);
        when(userRepository.findByUserName("solo")).thenReturn(Optional.of(u));
        when(sellerRepository.findByUserId(5)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/seller/products/1").with(user("solo").roles("SELLER")))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/seller/products creates with resolved seller id")
    void createProduct_created() throws Exception {
        stubSellerPrincipal("seller_pro", 5, 99);
        ProductRequest req = validProductRequest();
        when(productService.create(any(ProductRequest.class))).thenReturn(sampleProduct(12, 99));

        String json = mockMvc.perform(post("/api/seller/products")
                        .with(user("seller_pro").roles("SELLER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertEquals(12, objectMapper.readValue(json, ProductResponse.class).getId().intValue());
    }

    @Test
    @DisplayName("POST /api/seller/products returns 400 when body invalid")
    void createProduct_validation() throws Exception {
        stubSellerPrincipal("seller_pro", 5, 99);
        ProductRequest req = new ProductRequest();
        req.setName("");
        req.setPrice(-1);
        req.setSellerId(1);
        req.setCategoryId(1);

        String json = mockMvc.perform(post("/api/seller/products")
                        .with(user("seller_pro").roles("SELLER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Map<String, String> errors = objectMapper.readValue(json, new TypeReference<>() {});
        assertTrue(errors.containsKey("name") || errors.containsKey("price"));
    }

    @Test
    @DisplayName("PUT /api/seller/products/{id} updates when product owned")
    void updateProduct_ok() throws Exception {
        stubSellerPrincipal("seller_pro", 5, 99);
        ProductRequest req = validProductRequest();
        when(productService.getById(3)).thenReturn(sampleProduct(3, 99));
        when(productService.update(eq(3), any(ProductRequest.class))).thenReturn(sampleProduct(3, 99));

        mockMvc.perform(put("/api/seller/products/3")
                        .with(user("seller_pro").roles("SELLER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PUT /api/seller/products/{id} returns 403 for foreign product")
    void updateProduct_forbidden() throws Exception {
        stubSellerPrincipal("seller_pro", 5, 99);
        ProductRequest req = validProductRequest();
        when(productService.getById(3)).thenReturn(sampleProduct(3, 1));

        mockMvc.perform(put("/api/seller/products/3")
                        .with(user("seller_pro").roles("SELLER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /api/seller/products/{id} returns 204 when owned")
    void deleteProduct_noContent() throws Exception {
        stubSellerPrincipal("seller_pro", 5, 99);
        when(productService.getById(8)).thenReturn(sampleProduct(8, 99));

        mockMvc.perform(delete("/api/seller/products/8").with(user("seller_pro").roles("SELLER")))
                .andExpect(status().isNoContent());

        verify(productService).delete(8);
    }

    @Test
    @DisplayName("DELETE /api/seller/products/{id} returns 403 when not owned")
    void deleteProduct_forbidden() throws Exception {
        stubSellerPrincipal("seller_pro", 5, 99);
        when(productService.getById(8)).thenReturn(sampleProduct(8, 1));

        mockMvc.perform(delete("/api/seller/products/8").with(user("seller_pro").roles("SELLER")))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /api/seller/products/{id} returns 409 when product is used in orders")
    void deleteProduct_conflictWhenInOrders() throws Exception {
        stubSellerPrincipal("seller_pro", 5, 99);
        when(productService.getById(8)).thenReturn(sampleProduct(8, 99));
        doThrow(new IllegalStateException("Товар участвует в заказах и не может быть удален"))
                .when(productService).delete(8);

        String json = mockMvc.perform(delete("/api/seller/products/8").with(user("seller_pro").roles("SELLER")))
                .andExpect(status().isConflict())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse err = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(409, err.getStatus());
        assertEquals("Товар участвует в заказах и не может быть удален", err.getMessage());
    }

    private void stubSellerPrincipal(String username, int userId, int sellerId) {
        User u = new User();
        u.setId(userId);
        Seller s = new Seller();
        s.setId(sellerId);
        s.setUser(u);
        when(userRepository.findByUserName(username)).thenReturn(Optional.of(u));
        when(sellerRepository.findByUserId(userId)).thenReturn(Optional.of(s));
    }

    private static ProductRequest validProductRequest() {
        ProductRequest r = new ProductRequest();
        r.setName("Item");
        r.setPrice(10.0);
        r.setSellerId(0);
        r.setCategoryId(1);
        return r;
    }

    private static ProductResponse sampleProduct(int id, int sellerId) {
        ProductResponse r = new ProductResponse();
        r.setId(id);
        r.setName("Item");
        r.setPrice(10.0);
        r.setSellerId(sellerId);
        r.setCategoryId(1);
        r.setCreatedAt(LocalDateTime.parse("2024-06-01T12:00:00"));
        return r;
    }
}
