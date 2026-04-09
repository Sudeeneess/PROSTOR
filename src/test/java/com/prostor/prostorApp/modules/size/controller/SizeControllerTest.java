package com.prostor.prostorApp.modules.size.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prostor.prostorApp.common.exception.ErrorResponse;
import com.prostor.prostorApp.common.exception.GlobalExceptionHandler;
import com.prostor.prostorApp.modules.product.controller.SizeController;
import com.prostor.prostorApp.modules.product.dto.SizeRequest;
import com.prostor.prostorApp.modules.product.dto.SizeResponse;
import com.prostor.prostorApp.modules.product.service.SizeService;
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
        controllers = SizeController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class
        }
)
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalExceptionHandler.class, SpringDataWebAutoConfiguration.class})
@DisplayName("Size Controller Tests")
class SizeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SizeService sizeService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/sizes returns page")
    void getAll_DelegatesToService() throws Exception {
        SizeResponse item = sampleResponse(1, "S");
        Page<SizeResponse> page = new PageImpl<>(List.of(item), PageRequest.of(0, 10), 1);
        when(sizeService.getAll(any(Pageable.class))).thenReturn(page);

        String json = mockMvc.perform(get("/api/sizes")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode root = objectMapper.readTree(json);
        assertEquals(1, root.get("totalElements").asInt());
        assertEquals(1, root.get("content").size());
        assertEquals("S", root.get("content").get(0).get("name").asText());

        verify(sizeService).getAll(any(Pageable.class));
    }

    @Test
    @DisplayName("GET /api/sizes/{id} returns 200 when found")
    void getById_WhenFound_ReturnsOk() throws Exception {
        when(sizeService.getById(5)).thenReturn(sampleResponse(5, "M"));

        String json = mockMvc.perform(get("/api/sizes/5"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        SizeResponse body = objectMapper.readValue(json, SizeResponse.class);
        assertEquals(5, body.getId());
        assertEquals("M", body.getName());
    }

    @Test
    @DisplayName("GET /api/sizes/{id} returns 404 when not found")
    void getById_WhenMissing_ReturnsNotFound() throws Exception {
        when(sizeService.getById(999))
                .thenThrow(new EntityNotFoundException("Size not found with id: 999"));

        String json = mockMvc.perform(get("/api/sizes/999"))
                .andExpect(status().isNotFound())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(404, error.getStatus());
        assertEquals("Size not found with id: 999", error.getMessage());
    }

    @Test
    @DisplayName("POST /api/sizes returns 201")
    void create_ValidRequest_ReturnsCreated() throws Exception {
        SizeRequest request = validRequest();
        SizeResponse created = sampleResponse(10, request.getName());
        when(sizeService.create(any(SizeRequest.class))).thenReturn(created);

        String json = mockMvc.perform(post("/api/sizes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        SizeResponse body = objectMapper.readValue(json, SizeResponse.class);
        assertEquals(10, body.getId());
        assertEquals(request.getName(), body.getName());
    }

    @Test
    @DisplayName("POST /api/sizes returns 400 when validation fails")
    void create_InvalidRequest_ReturnsBadRequest() throws Exception {
        SizeRequest invalid = new SizeRequest();
        invalid.setName("");

        String json = mockMvc.perform(post("/api/sizes")
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
    @DisplayName("POST /api/sizes returns 400 on duplicate name")
    void create_DuplicateName_ReturnsBadRequest() throws Exception {
        SizeRequest request = validRequest();
        when(sizeService.create(any(SizeRequest.class)))
                .thenThrow(new IllegalArgumentException("Size with name 'X' already exists"));

        String json = mockMvc.perform(post("/api/sizes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(400, error.getStatus());
        assertEquals("Size with name 'X' already exists", error.getMessage());
    }

    @Test
    @DisplayName("PUT /api/sizes/{id} returns 200 when update succeeds")
    void update_ValidRequest_ReturnsOk() throws Exception {
        SizeRequest request = validRequest();
        SizeResponse updated = sampleResponse(3, request.getName());
        when(sizeService.update(eq(3), any(SizeRequest.class))).thenReturn(updated);

        String json = mockMvc.perform(put("/api/sizes/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        SizeResponse body = objectMapper.readValue(json, SizeResponse.class);
        assertEquals(3, body.getId());
        verify(sizeService).update(eq(3), any(SizeRequest.class));
    }

    @Test
    @DisplayName("PUT /api/sizes/{id} returns 404 when missing")
    void update_WhenNotFound_ReturnsNotFound() throws Exception {
        SizeRequest request = validRequest();
        when(sizeService.update(eq(3), any(SizeRequest.class)))
                .thenThrow(new EntityNotFoundException("Size not found with id: 3"));

        String json = mockMvc.perform(put("/api/sizes/3")
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
    @DisplayName("DELETE /api/sizes/{id} returns 204")
    void delete_WhenExists_ReturnsNoContent() throws Exception {
        doNothing().when(sizeService).delete(7);

        mockMvc.perform(delete("/api/sizes/7"))
                .andExpect(status().isNoContent());

        verify(sizeService).delete(7);
    }

    @Test
    @DisplayName("DELETE /api/sizes/{id} returns 404 when missing")
    void delete_WhenNotFound_ReturnsNotFound() throws Exception {
        doThrow(new EntityNotFoundException("Size not found with id: 7"))
                .when(sizeService).delete(7);

        String json = mockMvc.perform(delete("/api/sizes/7"))
                .andExpect(status().isNotFound())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(404, error.getStatus());
    }

    private static SizeRequest validRequest() {
        SizeRequest r = new SizeRequest();
        r.setName("XXL");
        return r;
    }

    private static SizeResponse sampleResponse(int id, String name) {
        SizeResponse r = new SizeResponse();
        r.setId(id);
        r.setName(name);
        return r;
    }
}
