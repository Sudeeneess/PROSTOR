package com.prostor.prostorApp.modules.product.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prostor.prostorApp.common.exception.ErrorResponse;
import com.prostor.prostorApp.common.exception.GlobalExceptionHandler;
import com.prostor.prostorApp.modules.product.dto.BrandRequest;
import com.prostor.prostorApp.modules.product.dto.BrandResponse;
import com.prostor.prostorApp.modules.product.service.BrandService;
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
        controllers = BrandController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class
        }
)
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalExceptionHandler.class, SpringDataWebAutoConfiguration.class})
@DisplayName("Brand Controller Tests")
class BrandControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BrandService brandService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/brands returns page")
    void getAll_DelegatesToService() throws Exception {
        BrandResponse item = sampleResponse(1, "Alpha");
        Page<BrandResponse> page = new PageImpl<>(List.of(item), PageRequest.of(0, 10), 1);
        when(brandService.getAll(any(Pageable.class))).thenReturn(page);

        String json = mockMvc.perform(get("/api/brands")
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

        verify(brandService).getAll(any(Pageable.class));
    }

    @Test
    @DisplayName("GET /api/brands/{id} returns 200 when found")
    void getById_WhenFound_ReturnsOk() throws Exception {
        when(brandService.getById(5)).thenReturn(sampleResponse(5, "Found"));

        String json = mockMvc.perform(get("/api/brands/5"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        BrandResponse body = objectMapper.readValue(json, BrandResponse.class);
        assertEquals(5, body.getId());
        assertEquals("Found", body.getName());
    }

    @Test
    @DisplayName("GET /api/brands/{id} returns 404 when not found")
    void getById_WhenMissing_ReturnsNotFound() throws Exception {
        when(brandService.getById(999))
                .thenThrow(new EntityNotFoundException("Brand not found with id: 999"));

        String json = mockMvc.perform(get("/api/brands/999"))
                .andExpect(status().isNotFound())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(404, error.getStatus());
        assertEquals("Brand not found with id: 999", error.getMessage());
    }

    @Test
    @DisplayName("POST /api/brands returns 201")
    void create_ValidRequest_ReturnsCreated() throws Exception {
        BrandRequest request = validRequest();
        BrandResponse created = sampleResponse(10, request.getName());
        when(brandService.create(any(BrandRequest.class))).thenReturn(created);

        String json = mockMvc.perform(post("/api/brands")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        BrandResponse body = objectMapper.readValue(json, BrandResponse.class);
        assertEquals(10, body.getId());
        assertEquals(request.getName(), body.getName());
    }

    @Test
    @DisplayName("POST /api/brands returns 400 when validation fails")
    void create_InvalidRequest_ReturnsBadRequest() throws Exception {
        BrandRequest invalid = new BrandRequest();
        invalid.setName("");

        String json = mockMvc.perform(post("/api/brands")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Map<String, String> errors = objectMapper.readValue(json, new TypeReference<>() {});
        assertTrue(errors.containsKey("name"));
    }

    @Test
    @DisplayName("POST /api/brands returns 400 on duplicate name")
    void create_DuplicateName_ReturnsBadRequest() throws Exception {
        BrandRequest request = validRequest();
        when(brandService.create(any(BrandRequest.class)))
                .thenThrow(new IllegalArgumentException("Brand with name 'X' already exists"));

        String json = mockMvc.perform(post("/api/brands")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(400, error.getStatus());
        assertEquals("Brand with name 'X' already exists", error.getMessage());
    }

    @Test
    @DisplayName("PUT /api/brands/{id} returns 200 when update succeeds")
    void update_ValidRequest_ReturnsOk() throws Exception {
        BrandRequest request = validRequest();
        BrandResponse updated = sampleResponse(3, request.getName());
        when(brandService.update(eq(3), any(BrandRequest.class))).thenReturn(updated);

        String json = mockMvc.perform(put("/api/brands/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        BrandResponse body = objectMapper.readValue(json, BrandResponse.class);
        assertEquals(3, body.getId());
        verify(brandService).update(eq(3), any(BrandRequest.class));
    }

    @Test
    @DisplayName("PUT /api/brands/{id} returns 404 when missing")
    void update_WhenNotFound_ReturnsNotFound() throws Exception {
        BrandRequest request = validRequest();
        when(brandService.update(eq(3), any(BrandRequest.class)))
                .thenThrow(new EntityNotFoundException("Brand not found with id: 3"));

        String json = mockMvc.perform(put("/api/brands/3")
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
    @DisplayName("DELETE /api/brands/{id} returns 204")
    void delete_WhenExists_ReturnsNoContent() throws Exception {
        doNothing().when(brandService).delete(7);

        mockMvc.perform(delete("/api/brands/7"))
                .andExpect(status().isNoContent());

        verify(brandService).delete(7);
    }

    @Test
    @DisplayName("DELETE /api/brands/{id} returns 404 when missing")
    void delete_WhenNotFound_ReturnsNotFound() throws Exception {
        doThrow(new EntityNotFoundException("Brand not found with id: 7"))
                .when(brandService).delete(7);

        String json = mockMvc.perform(delete("/api/brands/7"))
                .andExpect(status().isNotFound())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(404, error.getStatus());
    }

    private static BrandRequest validRequest() {
        BrandRequest r = new BrandRequest();
        r.setName("New Brand");
        return r;
    }

    private static BrandResponse sampleResponse(int id, String name) {
        BrandResponse r = new BrandResponse();
        r.setId(id);
        r.setName(name);
        return r;
    }
}
