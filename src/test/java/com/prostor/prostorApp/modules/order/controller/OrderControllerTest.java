package com.prostor.prostorApp.modules.order.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prostor.prostorApp.common.exception.ErrorResponse;
import com.prostor.prostorApp.common.exception.GlobalExceptionHandler;
import com.prostor.prostorApp.modules.order.dto.OrderItemRequest;
import com.prostor.prostorApp.modules.order.dto.OrderRequest;
import com.prostor.prostorApp.modules.order.dto.OrderResponse;
import com.prostor.prostorApp.modules.order.dto.OrderStatusDto;
import com.prostor.prostorApp.modules.order.service.OrderService;
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
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = OrderController.class,
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
@DisplayName("Order Controller Tests")
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/orders returns page")
    void getAll_ReturnsOk() throws Exception {
        OrderResponse row = sampleOrderResponse(1);
        Page<OrderResponse> page = new PageImpl<>(List.of(row), PageRequest.of(0, 20), 1);
        when(orderService.getAll(any(Pageable.class))).thenReturn(page);

        String json = mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode root = objectMapper.readTree(json);
        assertEquals(1, root.get("totalElements").asInt());
        verify(orderService).getAll(any(Pageable.class));
    }

    @Test
    @DisplayName("GET /api/orders/{id} returns 200")
    void getById_ReturnsOk() throws Exception {
        when(orderService.getById(5)).thenReturn(sampleOrderResponse(5));

        String json = mockMvc.perform(get("/api/orders/5"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        OrderResponse body = objectMapper.readValue(json, OrderResponse.class);
        assertEquals(5, body.getId());
    }

    @Test
    @DisplayName("GET /api/orders/{id} returns 404")
    void getById_NotFound() throws Exception {
        when(orderService.getById(5))
                .thenThrow(new EntityNotFoundException("Заказ с идентификатором не найден: 5"));

        String json = mockMvc.perform(get("/api/orders/5"))
                .andExpect(status().isNotFound())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse err = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(404, err.getStatus());
    }

    @Test
    @DisplayName("GET /api/orders/customer/{id} returns list")
    void getByCustomer_ReturnsOk() throws Exception {
        when(orderService.getByCustomer(3)).thenReturn(List.of(sampleOrderResponse(1)));

        String json = mockMvc.perform(get("/api/orders/customer/3"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        List<OrderResponse> list = objectMapper.readValue(json, new TypeReference<>() {});
        assertEquals(1, list.size());
    }

    @Test
    @DisplayName("GET /api/orders/status/{statusId} returns page")
    void getByStatus_ReturnsOk() throws Exception {
        Page<OrderResponse> page = new PageImpl<>(List.of(sampleOrderResponse(1)), PageRequest.of(0, 20), 1);
        when(orderService.getByStatus(eq(2), any(Pageable.class))).thenReturn(page);

        String json = mockMvc.perform(get("/api/orders/status/2"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode root = objectMapper.readTree(json);
        assertEquals(1, root.get("totalElements").asInt());
    }

    @Test
    @DisplayName("POST /api/orders returns 201")
    void create_ReturnsCreated() throws Exception {
        OrderRequest req = validOrderRequest();
        when(orderService.createOrder(any(OrderRequest.class))).thenReturn(sampleOrderResponse(9));

        String json = mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        OrderResponse body = objectMapper.readValue(json, OrderResponse.class);
        assertEquals(9, body.getId());
    }

    @Test
    @DisplayName("POST /api/orders returns 400 when validation fails")
    void create_InvalidBody() throws Exception {
        OrderRequest req = new OrderRequest();
        req.setCustomerId(1);
        req.setItems(Collections.emptyList());

        String json = mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Map<String, String> errors = objectMapper.readValue(json, new TypeReference<>() {});
        assertTrue(errors.containsKey("items"));
    }

    @Test
    @DisplayName("PUT /api/orders/{id}/confirm returns 200")
    void confirm_ReturnsOk() throws Exception {
        when(orderService.confirmOrder(7)).thenReturn(sampleOrderResponse(7));

        String json = mockMvc.perform(put("/api/orders/7/confirm"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertEquals(7, objectMapper.readValue(json, OrderResponse.class).getId());
    }

    @Test
    @DisplayName("PUT /api/orders/{id}/confirm returns 409 on illegal state")
    void confirm_Conflict() throws Exception {
        when(orderService.confirmOrder(7))
                .thenThrow(new IllegalStateException("Заказ не может быть подтвержден"));

        String json = mockMvc.perform(put("/api/orders/7/confirm"))
                .andExpect(status().isConflict())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ErrorResponse err = objectMapper.readValue(json, ErrorResponse.class);
        assertEquals(409, err.getStatus());
    }

    @Test
    @DisplayName("PUT /api/orders/{id}/cancel returns 200")
    void cancel_ReturnsOk() throws Exception {
        when(orderService.cancelOrder(8)).thenReturn(sampleOrderResponse(8));

        mockMvc.perform(put("/api/orders/8/cancel"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PUT /api/orders/{id}/status/{statusId} returns 200")
    void updateStatus_ReturnsOk() throws Exception {
        when(orderService.updateStatus(4, 2)).thenReturn(sampleOrderResponse(4));

        mockMvc.perform(put("/api/orders/4/status/2"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("DELETE /api/orders/{id} returns 204")
    void delete_ReturnsNoContent() throws Exception {
        doNothing().when(orderService).deleteOrder(11);

        mockMvc.perform(delete("/api/orders/11"))
                .andExpect(status().isNoContent());

        verify(orderService).deleteOrder(11);
    }

    private static OrderRequest validOrderRequest() {
        OrderItemRequest line = new OrderItemRequest();
        line.setProductId(1);
        line.setAmount(10.0);
        OrderRequest r = new OrderRequest();
        r.setCustomerId(1);
        r.setItems(List.of(line));
        return r;
    }

    private static OrderResponse sampleOrderResponse(int id) {
        OrderStatusDto st = new OrderStatusDto();
        st.setId(1);
        st.setName("PENDING");
        OrderResponse r = new OrderResponse();
        r.setId(id);
        r.setCustomerId(1);
        r.setStatus(st);
        r.setOrderDate(LocalDateTime.parse("2024-06-01T12:00:00"));
        r.setTotalAmount(10.0);
        r.setItems(Collections.emptyList());
        return r;
    }
}
