package com.prostor.prostorApp.modules.product.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prostor.prostorApp.common.exception.ErrorResponse;
import com.prostor.prostorApp.common.exception.GlobalExceptionHandler;
import com.prostor.prostorApp.modules.product.dto.ProductRequest;
import com.prostor.prostorApp.modules.product.dto.ProductResponse;
import com.prostor.prostorApp.modules.product.service.ProductService;
import com.prostor.prostorApp.security.JwtAuthenticationFilter;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.data.web.SpringDataWebAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = ProductController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class
        }
)
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalExceptionHandler.class, SpringDataWebAutoConfiguration.class})
@DisplayName("Product Controller Tests")
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    /**
     * Satisfies component scan without pulling JwtTokenProvider; not invoked when {@code addFilters = false}.
     */
    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/products forwards filters and returns page")
    void getAll_WithQueryParams_DelegatesToService() throws Exception {
        ProductResponse item = sampleResponse(1, "Alpha");
        Page<ProductResponse> page = new PageImpl<>(List.of(item), PageRequest.of(0, 10), 1);
        when(productService.filter(eq(1), eq(2), eq(10.0), eq(99.0), eq("needle"), any(Pageable.class)))
                .thenReturn(page);

        String json = mockMvc.perform(get("/api/products")
                        .param("categoryId", "1")
                        .param("sellerId", "2")
                        .param("minPrice", "10")
                        .param("maxPrice", "99")
                        .param("name", "needle")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode root = objectMapper.readTree(json);
        assertEquals(1, root.get("totalElements").asInt());
        assertEquals(1, root.get("content").size());
        assertEquals("Alpha", root.get("content").get(0).get("name").asText());

        verify(productService).filter(eq(1), eq(2), eq(10.0), eq(99.0), eq("needle"), any(Pageable.class));
    }

    @Test
    @DisplayName("GET /api/products/{id} returns 200 when product exists")
    void getById_WhenFound_ReturnsOk() throws Exception {
        when(productService.getById(5)).thenReturn(sampleResponse(5, "Found"));

        String json = mockMvc.perform(get("/api/products/5"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ProductResponse body = objectMapper.readValue(json, ProductResponse.class);
        assertEquals(5, body.getId());
        assertEquals("Found", body.getName());

        verify(productService).getById(5);
    }

    @Test
    @DisplayName("GET /api/products/{id} returns 404 when not found")
    void getById_WhenMissing_ReturnsNotFound() throws Exception {
        when(productService.getById(999))
                .thenThrow(new EntityNotFoundException("Product not found with id: 999"));

        String json = mockMvc.perform(get("/api/products/999"))
                .andExpect(status().isNotFound())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(404, error.getStatus());
        assertEquals("Product not found with id: 999", error.getMessage());
    }

    @Test
    @DisplayName("POST /api/products returns 201 and body")
    void create_ValidRequest_ReturnsCreated() throws Exception {
        ProductRequest request = validRequest();
        ProductResponse created = sampleResponse(10, request.getName());
        when(productService.create(any(ProductRequest.class))).thenReturn(created);

        String json = mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ProductResponse body = objectMapper.readValue(json, ProductResponse.class);
        assertEquals(10, body.getId());
        assertEquals(request.getName(), body.getName());

        verify(productService).create(any(ProductRequest.class));
    }

    @Test
    @DisplayName("POST /api/products returns 400 when validation fails")
    void create_InvalidRequest_ReturnsBadRequest() throws Exception {
        ProductRequest invalid = new ProductRequest();
        invalid.setName("");
        invalid.setPrice(-5);
        invalid.setSellerId(null);
        invalid.setCategoryId(null);

        String json = mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Map<String, String> errors = objectMapper.readValue(json, new TypeReference<>() {});
        assertTrue(errors.containsKey("name"));
        assertTrue(errors.containsKey("price"));
        assertTrue(errors.containsKey("sellerId"));
        assertTrue(errors.containsKey("categoryId"));
    }

    @Test
    @DisplayName("POST /api/products returns 400 on duplicate name (IllegalArgumentException)")
    void create_DuplicateName_ReturnsBadRequest() throws Exception {
        ProductRequest request = validRequest();
        when(productService.create(any(ProductRequest.class)))
                .thenThrow(new IllegalArgumentException("Product with name 'X' already exists for this seller"));

        String json = mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(400, error.getStatus());
        assertEquals("Product with name 'X' already exists for this seller", error.getMessage());
    }

    @Test
    @DisplayName("PUT /api/products/{id} returns 200 when update succeeds")
    void update_ValidRequest_ReturnsOk() throws Exception {
        ProductRequest request = validRequest();
        ProductResponse updated = sampleResponse(3, request.getName());
        when(productService.update(eq(3), any(ProductRequest.class))).thenReturn(updated);

        String json = mockMvc.perform(put("/api/products/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ProductResponse body = objectMapper.readValue(json, ProductResponse.class);
        assertEquals(3, body.getId());

        verify(productService).update(eq(3), any(ProductRequest.class));
    }

    @Test
    @DisplayName("PUT /api/products/{id} returns 404 when product missing")
    void update_WhenNotFound_ReturnsNotFound() throws Exception {
        ProductRequest request = validRequest();
        when(productService.update(eq(3), any(ProductRequest.class)))
                .thenThrow(new EntityNotFoundException("Product not found with id: 3"));

        String json = mockMvc.perform(put("/api/products/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(404, error.getStatus());
    }

    @Test
    @DisplayName("DELETE /api/products/{id} returns 204")
    void delete_WhenExists_ReturnsNoContent() throws Exception {
        doNothing().when(productService).delete(7);

        mockMvc.perform(delete("/api/products/7"))
                .andExpect(status().isNoContent());

        verify(productService).delete(7);
    }

    @Test
    @DisplayName("DELETE /api/products/{id} returns 404 when product missing")
    void delete_WhenNotFound_ReturnsNotFound() throws Exception {
        doThrow(new EntityNotFoundException("Product not found with id: 7"))
                .when(productService).delete(7);

        String json = mockMvc.perform(delete("/api/products/7"))
                .andExpect(status().isNotFound())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(404, error.getStatus());
    }

    private static ProductRequest validRequest() {
        ProductRequest r = new ProductRequest();
        r.setName("New Product");
        r.setPrice(49.99);
        r.setSellerId(1);
        r.setCategoryId(2);
        return r;
    }

    private static ProductResponse sampleResponse(int id, String name) {
        ProductResponse r = new ProductResponse();
        r.setId(id);
        r.setName(name);
        r.setPrice(10.0);
        r.setSellerId(1);
        r.setCategoryId(1);
        r.setCreatedAt(LocalDateTime.parse("2024-01-15T12:00:00"));
        return r;
    }
}
