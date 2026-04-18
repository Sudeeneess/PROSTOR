package com.prostor.prostorApp.modules.category.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prostor.prostorApp.common.exception.ErrorResponse;
import com.prostor.prostorApp.common.exception.GlobalExceptionHandler;
import com.prostor.prostorApp.modules.product.controller.CategoryController;
import com.prostor.prostorApp.modules.product.dto.CategoryRequest;
import com.prostor.prostorApp.modules.product.dto.CategoryResponse;
import com.prostor.prostorApp.modules.product.service.CategoryService;
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
        controllers = CategoryController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class
        }
)
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalExceptionHandler.class, SpringDataWebAutoConfiguration.class})
@DisplayName("Category Controller Tests")
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CategoryService categoryService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/categories returns page")
    void getAll_DelegatesToService() throws Exception {
        CategoryResponse item = sampleResponse(1, "Alpha");
        Page<CategoryResponse> page = new PageImpl<>(List.of(item), PageRequest.of(0, 10), 1);
        when(categoryService.getAll(any(Pageable.class))).thenReturn(page);

        String json = mockMvc.perform(get("/api/categories")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode root = objectMapper.readTree(json);
        assertEquals(1, root.get("totalElements").asInt());
        assertEquals(1, root.get("content").size());
        assertEquals("Alpha", root.get("content").get(0).get("categoryName").asText());

        verify(categoryService).getAll(any(Pageable.class));
    }

    @Test
    @DisplayName("GET /api/categories/{id} returns 200 when found")
    void getById_WhenFound_ReturnsOk() throws Exception {
        when(categoryService.getById(5)).thenReturn(sampleResponse(5, "Found"));

        String json = mockMvc.perform(get("/api/categories/5"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        CategoryResponse body = objectMapper.readValue(json, CategoryResponse.class);
        assertEquals(5, body.getId());
        assertEquals("Found", body.getCategoryName());
    }

    @Test
    @DisplayName("GET /api/categories/{id} returns 404 when not found")
    void getById_WhenMissing_ReturnsNotFound() throws Exception {
        when(categoryService.getById(999))
                .thenThrow(new EntityNotFoundException("Category not found with id: 999"));

        String json = mockMvc.perform(get("/api/categories/999"))
                .andExpect(status().isNotFound())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(404, error.getStatus());
        assertEquals("Category not found with id: 999", error.getMessage());
    }

    @Test
    @DisplayName("POST /api/categories returns 201")
    void create_ValidRequest_ReturnsCreated() throws Exception {
        CategoryRequest request = validRequest();
        CategoryResponse created = sampleResponse(10, request.getCategoryName());
        when(categoryService.create(any(CategoryRequest.class))).thenReturn(created);

        String json = mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        CategoryResponse body = objectMapper.readValue(json, CategoryResponse.class);
        assertEquals(10, body.getId());
        assertEquals(request.getCategoryName(), body.getCategoryName());
    }

    @Test
    @DisplayName("POST /api/categories returns 400 when validation fails")
    void create_InvalidRequest_ReturnsBadRequest() throws Exception {
        CategoryRequest invalid = new CategoryRequest();
        invalid.setCategoryName("");

        String json = mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Map<String, String> errors = objectMapper.readValue(json, new TypeReference<>() {});
        assertTrue(errors.containsKey("categoryName"));
    }

    @Test
    @DisplayName("POST /api/categories returns 400 on duplicate name")
    void create_DuplicateName_ReturnsBadRequest() throws Exception {
        CategoryRequest request = validRequest();
        when(categoryService.create(any(CategoryRequest.class)))
                .thenThrow(new IllegalArgumentException("Category with name 'X' already exists"));

        String json = mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(400, error.getStatus());
        assertEquals("Category with name 'X' already exists", error.getMessage());
    }

    @Test
    @DisplayName("PUT /api/categories/{id} returns 200 when update succeeds")
    void update_ValidRequest_ReturnsOk() throws Exception {
        CategoryRequest request = validRequest();
        CategoryResponse updated = sampleResponse(3, request.getCategoryName());
        when(categoryService.update(eq(3), any(CategoryRequest.class))).thenReturn(updated);

        String json = mockMvc.perform(put("/api/categories/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        CategoryResponse body = objectMapper.readValue(json, CategoryResponse.class);
        assertEquals(3, body.getId());
        verify(categoryService).update(eq(3), any(CategoryRequest.class));
    }

    @Test
    @DisplayName("PUT /api/categories/{id} returns 404 when missing")
    void update_WhenNotFound_ReturnsNotFound() throws Exception {
        CategoryRequest request = validRequest();
        when(categoryService.update(eq(3), any(CategoryRequest.class)))
                .thenThrow(new EntityNotFoundException("Category not found with id: 3"));

        String json = mockMvc.perform(put("/api/categories/3")
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
    @DisplayName("DELETE /api/categories/{id} returns 204")
    void delete_WhenExists_ReturnsNoContent() throws Exception {
        doNothing().when(categoryService).delete(7);

        mockMvc.perform(delete("/api/categories/7"))
                .andExpect(status().isNoContent());

        verify(categoryService).delete(7);
    }

    @Test
    @DisplayName("DELETE /api/categories/{id} returns 404 when missing")
    void delete_WhenNotFound_ReturnsNotFound() throws Exception {
        doThrow(new EntityNotFoundException("Category not found with id: 7"))
                .when(categoryService).delete(7);

        String json = mockMvc.perform(delete("/api/categories/7"))
                .andExpect(status().isNotFound())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(404, error.getStatus());
    }

    private static CategoryRequest validRequest() {
        CategoryRequest r = new CategoryRequest();
        r.setCategoryName("New Category");
        return r;
    }

    private static CategoryResponse sampleResponse(int id, String name) {
        CategoryResponse r = new CategoryResponse();
        r.setId(id);
        r.setCategoryName(name);
        return r;
    }
}
