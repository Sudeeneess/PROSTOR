package com.prostor.prostorApp.modules.productCard.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prostor.prostorApp.common.exception.ErrorResponse;
import com.prostor.prostorApp.common.exception.GlobalExceptionHandler;
import com.prostor.prostorApp.modules.product.controller.ProductCardController;
import com.prostor.prostorApp.modules.product.dto.ProductCardRequest;
import com.prostor.prostorApp.modules.product.dto.ProductCardResponse;
import com.prostor.prostorApp.modules.product.service.ProductCardService;
import com.prostor.prostorApp.security.JwtAuthenticationFilter;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
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
        controllers = ProductCardController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class
        }
)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@DisplayName("ProductCard Controller Tests")
class ProductCardControllerTest {

    private static final String BASE = "/api/products/10/cards";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductCardService cardService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/products/{productId}/cards returns list")
    void getByProductId_ReturnsOk() throws Exception {
        ProductCardResponse item = sampleResponse(1, 10);
        when(cardService.getByProductId(10)).thenReturn(List.of(item));

        String json = mockMvc.perform(get(BASE))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        List<ProductCardResponse> list = objectMapper.readValue(json, new TypeReference<>() {});
        assertEquals(1, list.size());
        assertEquals(1, list.get(0).getId());
        verify(cardService).getByProductId(10);
    }

    @Test
    @DisplayName("GET /api/products/{productId}/cards/{cardId} returns 200")
    void getById_WhenFound_ReturnsOk() throws Exception {
        when(cardService.getById(5)).thenReturn(sampleResponse(5, 10));

        String json = mockMvc.perform(get(BASE + "/5"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ProductCardResponse body = objectMapper.readValue(json, ProductCardResponse.class);
        assertEquals(5, body.getId());
        assertEquals(10, body.getProductId());
    }

    @Test
    @DisplayName("GET /api/products/{productId}/cards/{cardId} returns 404")
    void getById_WhenMissing_ReturnsNotFound() throws Exception {
        when(cardService.getById(5))
                .thenThrow(new EntityNotFoundException("ProductCard not found with id: 5"));

        String json = mockMvc.perform(get(BASE + "/5"))
                .andExpect(status().isNotFound())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(404, error.getStatus());
    }

    @Test
    @DisplayName("POST returns 201 when path and body productId match")
    void create_Valid_ReturnsCreated() throws Exception {
        ProductCardRequest req = validBody(10);
        when(cardService.create(any(ProductCardRequest.class))).thenReturn(sampleResponse(99, 10));

        String json = mockMvc.perform(post(BASE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ProductCardResponse body = objectMapper.readValue(json, ProductCardResponse.class);
        assertEquals(99, body.getId());
        verify(cardService).create(any(ProductCardRequest.class));
    }

    @Test
    @DisplayName("POST returns 400 when productId missing in body (@Valid)")
    void create_MissingProductId_ReturnsBadRequest() throws Exception {
        String body = """
                {"description":"Good description","type":"standard","photo":[]}
                """;

        String json = mockMvc.perform(post(BASE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Map<String, String> errors = objectMapper.readValue(json, new TypeReference<>() {});
        assertTrue(errors.containsKey("productId"));
    }

    @Test
    @DisplayName("POST returns 400 when path productId does not match body")
    void create_ProductIdMismatch_ReturnsBadRequest() throws Exception {
        ProductCardRequest req = validBody(99);

        String json = mockMvc.perform(post(BASE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(400, error.getStatus());
        assertTrue(error.getMessage().contains("does not match"));
    }

    @Test
    @DisplayName("POST returns 400 when validation fails")
    void create_InvalidBody_ReturnsBadRequest() throws Exception {
        ProductCardRequest req = new ProductCardRequest();
        req.setProductId(10);
        req.setDescription("");
        req.setType("");

        String json = mockMvc.perform(post(BASE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Map<String, String> errors = objectMapper.readValue(json, new TypeReference<>() {});
        assertTrue(errors.containsKey("description") || errors.containsKey("type"));
    }

    @Test
    @DisplayName("PUT returns 200")
    void update_Valid_ReturnsOk() throws Exception {
        ProductCardRequest req = validBody(10);
        when(cardService.update(eq(3), any(ProductCardRequest.class))).thenReturn(sampleResponse(3, 10));

        String json = mockMvc.perform(put(BASE + "/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ProductCardResponse body = objectMapper.readValue(json, ProductCardResponse.class);
        assertEquals(3, body.getId());
        verify(cardService).update(eq(3), any(ProductCardRequest.class));
    }

    @Test
    @DisplayName("PUT returns 404 when card missing")
    void update_WhenNotFound_ReturnsNotFound() throws Exception {
        ProductCardRequest req = validBody(10);
        when(cardService.update(eq(3), any(ProductCardRequest.class)))
                .thenThrow(new EntityNotFoundException("ProductCard not found with id: 3"));

        String json = mockMvc.perform(put(BASE + "/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(404, error.getStatus());
    }

    @Test
    @DisplayName("DELETE returns 204")
    void delete_WhenExists_ReturnsNoContent() throws Exception {
        doNothing().when(cardService).delete(7);

        mockMvc.perform(delete(BASE + "/7"))
                .andExpect(status().isNoContent());

        verify(cardService).delete(7);
    }

    @Test
    @DisplayName("DELETE returns 404 when missing")
    void delete_WhenMissing_ReturnsNotFound() throws Exception {
        doThrow(new EntityNotFoundException("ProductCard not found with id: 7"))
                .when(cardService).delete(7);

        String json = mockMvc.perform(delete(BASE + "/7"))
                .andExpect(status().isNotFound())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(404, error.getStatus());
    }

    private static ProductCardRequest validBody(int productId) {
        ProductCardRequest r = new ProductCardRequest();
        r.setProductId(productId);
        r.setDescription("Good description");
        r.setType("standard");
        r.setPhoto(Collections.emptyList());
        r.setIsActive(true);
        return r;
    }

    private static ProductCardResponse sampleResponse(int cardId, int productId) {
        ProductCardResponse r = new ProductCardResponse();
        r.setId(cardId);
        r.setProductId(productId);
        r.setDescription("d");
        r.setType("t");
        r.setPhoto(Collections.emptyList());
        r.setIsActive(true);
        return r;
    }
}
