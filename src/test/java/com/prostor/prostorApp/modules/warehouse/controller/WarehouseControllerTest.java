package com.prostor.prostorApp.modules.warehouse.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prostor.prostorApp.common.exception.ErrorResponse;
import com.prostor.prostorApp.common.exception.GlobalExceptionHandler;
import com.prostor.prostorApp.modules.warehouse.dto.WarehouseRequest;
import com.prostor.prostorApp.modules.warehouse.dto.WarehouseResponse;
import com.prostor.prostorApp.modules.warehouse.dto.WarehouseStockRequest;
import com.prostor.prostorApp.modules.warehouse.dto.WarehouseStockResponse;
import com.prostor.prostorApp.modules.warehouse.service.WarehouseService;
import com.prostor.prostorApp.modules.warehouse.service.WarehouseStockService;
import com.prostor.prostorApp.security.JwtAuthenticationFilter;
import jakarta.persistence.EntityNotFoundException;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = WarehouseController.class,
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
        SpringDataWebAutoConfiguration.class
})
@DisplayName("Warehouse Controller Tests")
class WarehouseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private WarehouseService warehouseService;

    @MockBean
    private WarehouseStockService warehouseStockService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/warehouses returns page")
    void getAllWarehouses_ReturnsOk() throws Exception {
        WarehouseResponse row = sampleWarehouseResponse(1);
        Page<WarehouseResponse> page = new PageImpl<>(List.of(row), PageRequest.of(0, 20), 1);
        when(warehouseService.getAll(any(Pageable.class))).thenReturn(page);

        String json = mockMvc.perform(get("/api/warehouses"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode root = objectMapper.readTree(json);
        assertEquals(1, root.get("totalElements").asInt());
        verify(warehouseService).getAll(any(Pageable.class));
    }

    @Test
    @DisplayName("GET /api/warehouses/{id} returns 200")
    void getWarehouseById_ReturnsOk() throws Exception {
        when(warehouseService.getById(5)).thenReturn(sampleWarehouseResponse(5));

        String json = mockMvc.perform(get("/api/warehouses/5"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        WarehouseResponse body = objectMapper.readValue(json, WarehouseResponse.class);
        assertEquals(5, body.getId());
    }

    @Test
    @DisplayName("GET /api/warehouses/{id} returns 404")
    void getWarehouseById_NotFound() throws Exception {
        when(warehouseService.getById(5))
                .thenThrow(new EntityNotFoundException("Warehouse not found with id: 5"));

        String json = mockMvc.perform(get("/api/warehouses/5"))
                .andExpect(status().isNotFound())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse err = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(404, err.getStatus());
    }

    @Test
    @DisplayName("POST /api/warehouses returns 201")
    void createWarehouse_ReturnsCreated() throws Exception {
        WarehouseRequest req = validWarehouseRequest();
        when(warehouseService.create(any(WarehouseRequest.class))).thenReturn(sampleWarehouseResponse(9));

        String json = mockMvc.perform(post("/api/warehouses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertEquals(9, objectMapper.readValue(json, WarehouseResponse.class).getId());
    }

    @Test
    @DisplayName("POST /api/warehouses returns 400 when validation fails")
    void createWarehouse_InvalidBody() throws Exception {
        WarehouseRequest req = new WarehouseRequest();
        req.setWarehouseManagerId(null);
        req.setWarehouseAddress("");

        String json = mockMvc.perform(post("/api/warehouses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Map<String, String> errors = objectMapper.readValue(json, new TypeReference<>() {});
        assertTrue(errors.containsKey("warehouseManagerId") || errors.containsKey("warehouseAddress"));
    }

    @Test
    @DisplayName("PUT /api/warehouses/{id} returns 200")
    void updateWarehouse_ReturnsOk() throws Exception {
        WarehouseRequest req = validWarehouseRequest();
        when(warehouseService.update(eq(3), any(WarehouseRequest.class))).thenReturn(sampleWarehouseResponse(3));

        String json = mockMvc.perform(put("/api/warehouses/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertEquals(3, objectMapper.readValue(json, WarehouseResponse.class).getId());
    }

    @Test
    @DisplayName("PUT /api/warehouses/{id} returns 404")
    void updateWarehouse_NotFound() throws Exception {
        WarehouseRequest req = validWarehouseRequest();
        when(warehouseService.update(eq(3), any(WarehouseRequest.class)))
                .thenThrow(new EntityNotFoundException("Warehouse not found with id: 3"));

        mockMvc.perform(put("/api/warehouses/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/warehouses/{id} returns 204")
    void deleteWarehouse_ReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/warehouses/11"))
                .andExpect(status().isNoContent());

        verify(warehouseService).delete(11);
    }

    @Test
    @DisplayName("DELETE /api/warehouses/{id} returns 404")
    void deleteWarehouse_NotFound() throws Exception {
        doThrow(new EntityNotFoundException("Warehouse not found with id: 11"))
                .when(warehouseService).delete(11);

        mockMvc.perform(delete("/api/warehouses/11"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/warehouses/stocks returns list")
    void getAllStocks_ReturnsOk() throws Exception {
        when(warehouseStockService.getAll(null, null)).thenReturn(List.of(sampleStockResponse(1)));

        String json = mockMvc.perform(get("/api/warehouses/stocks"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        List<WarehouseStockResponse> list = objectMapper.readValue(json, new TypeReference<>() {});
        assertEquals(1, list.size());
    }

    @Test
    @DisplayName("GET /api/warehouses/stocks with query params delegates to service")
    void getAllStocks_WithFilters() throws Exception {
        when(warehouseStockService.getAll(2, 7)).thenReturn(List.of());

        mockMvc.perform(get("/api/warehouses/stocks").param("warehouseId", "2").param("productId", "7"))
                .andExpect(status().isOk());

        verify(warehouseStockService).getAll(2, 7);
    }

    @Test
    @DisplayName("GET /api/warehouses/stocks/{id} returns 200")
    void getStockById_ReturnsOk() throws Exception {
        when(warehouseStockService.getById(8)).thenReturn(sampleStockResponse(8));

        String json = mockMvc.perform(get("/api/warehouses/stocks/8"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertEquals(8, objectMapper.readValue(json, WarehouseStockResponse.class).getId());
    }

    @Test
    @DisplayName("GET /api/warehouses/stocks/{id} returns 404")
    void getStockById_NotFound() throws Exception {
        when(warehouseStockService.getById(8))
                .thenThrow(new EntityNotFoundException("WarehouseStock not found with id: 8"));

        mockMvc.perform(get("/api/warehouses/stocks/8"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/warehouses/stocks returns 201")
    void createStock_ReturnsCreated() throws Exception {
        WarehouseStockRequest req = validStockRequest();
        when(warehouseStockService.create(any(WarehouseStockRequest.class))).thenReturn(sampleStockResponse(20));

        String json = mockMvc.perform(post("/api/warehouses/stocks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertEquals(20, objectMapper.readValue(json, WarehouseStockResponse.class).getId());
    }

    @Test
    @DisplayName("POST /api/warehouses/stocks returns 400 on validation error")
    void createStock_InvalidBody() throws Exception {
        WarehouseStockRequest req = new WarehouseStockRequest();
        req.setWarehouseId(null);
        req.setProductId(1);
        req.setQuantity(-1);

        String json = mockMvc.perform(post("/api/warehouses/stocks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Map<String, String> errors = objectMapper.readValue(json, new TypeReference<>() {});
        assertTrue(errors.containsKey("warehouseId") || errors.containsKey("quantity"));
    }

    @Test
    @DisplayName("POST /api/warehouses/stocks returns 400 on duplicate stock")
    void createStock_Duplicate() throws Exception {
        WarehouseStockRequest req = validStockRequest();
        when(warehouseStockService.create(any(WarehouseStockRequest.class)))
                .thenThrow(new IllegalArgumentException("Stock entry already exists for this warehouse and product"));

        String json = mockMvc.perform(post("/api/warehouses/stocks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse err = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(400, err.getStatus());
    }

    @Test
    @DisplayName("PUT /api/warehouses/stocks/{id} returns 200")
    void updateStock_ReturnsOk() throws Exception {
        WarehouseStockRequest req = validStockRequest();
        when(warehouseStockService.update(eq(4), any(WarehouseStockRequest.class))).thenReturn(sampleStockResponse(4));

        mockMvc.perform(put("/api/warehouses/stocks/4")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("DELETE /api/warehouses/stocks/{id} returns 204")
    void deleteStock_ReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/warehouses/stocks/12"))
                .andExpect(status().isNoContent());

        verify(warehouseStockService).delete(12);
    }

    private static WarehouseRequest validWarehouseRequest() {
        WarehouseRequest r = new WarehouseRequest();
        r.setWarehouseManagerId(1);
        r.setWarehouseAddress("Test address");
        return r;
    }

    private static WarehouseStockRequest validStockRequest() {
        WarehouseStockRequest r = new WarehouseStockRequest();
        r.setWarehouseId(1);
        r.setProductId(10);
        r.setQuantity(5);
        return r;
    }

    private static WarehouseResponse sampleWarehouseResponse(int id) {
        WarehouseResponse r = new WarehouseResponse();
        r.setId(id);
        r.setWarehouseManagerId(1);
        r.setWarehouseAddress("Addr");
        return r;
    }

    private static WarehouseStockResponse sampleStockResponse(int id) {
        WarehouseStockResponse r = new WarehouseStockResponse();
        r.setId(id);
        r.setWarehouseId(1);
        r.setProductId(10);
        r.setProductName("P");
        r.setQuantity(1);
        r.setReservedQuantity(0);
        r.setSoldQuantity(0);
        r.setUpdatedAt(LocalDateTime.parse("2024-06-01T12:00:00"));
        return r;
    }
}
