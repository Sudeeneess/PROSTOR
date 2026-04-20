package com.prostor.prostorApp.modules.warehouse.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prostor.prostorApp.common.exception.GlobalExceptionHandler;
import com.prostor.prostorApp.modules.user.model.User;
import com.prostor.prostorApp.modules.user.model.WarehouseManager;
import com.prostor.prostorApp.modules.user.repository.UserRepository;
import com.prostor.prostorApp.modules.user.repository.WarehouseManagerRepository;
import com.prostor.prostorApp.modules.warehouse.dto.GoodsReceptionDetailsResponse;
import com.prostor.prostorApp.modules.warehouse.dto.GoodsReceptionListResponse;
import com.prostor.prostorApp.modules.warehouse.model.ReceptionStatus;
import com.prostor.prostorApp.modules.warehouse.service.GoodsReceptionService;
import com.prostor.prostorApp.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = GoodsReceptionController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class
        }
)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@DisplayName("GoodsReception Controller Tests")
class GoodsReceptionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GoodsReceptionService goodsReceptionService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private WarehouseManagerRepository warehouseManagerRepository;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/warehouse/receptions returns filtered list")
    void getReceptions_returnsList() throws Exception {
        GoodsReceptionListResponse row = new GoodsReceptionListResponse();
        row.setId(1);
        row.setSellerId(2);
        row.setStatus(ReceptionStatus.PENDING);
        row.setCreatedAt(LocalDateTime.parse("2026-04-20T12:00:00"));
        row.setPositionsCount(3);
        when(goodsReceptionService.getForWarehouse(eq(ReceptionStatus.PENDING), eq(2), any(), any()))
                .thenReturn(List.of(row));

        mockMvc.perform(get("/api/warehouse/receptions")
                        .param("status", "PENDING")
                        .param("sellerId", "2")
                        .param("fromDate", "2026-04-01")
                        .param("toDate", "2026-04-30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].positionsCount").value(3));
    }

    @Test
    @DisplayName("GET /api/warehouse/receptions/{id} returns details")
    void getById_returnsDetails() throws Exception {
        GoodsReceptionDetailsResponse details = new GoodsReceptionDetailsResponse();
        details.setId(7);
        details.setSellerId(2);
        details.setStatus(ReceptionStatus.PENDING);
        when(goodsReceptionService.getDetails(7)).thenReturn(details);

        mockMvc.perform(get("/api/warehouse/receptions/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7));
    }

    @Test
    @DisplayName("POST /api/warehouse/receptions/{id}/accept accepts reception")
    void acceptReception_returnsAccepted() throws Exception {
        User u = new User();
        u.setId(11);
        WarehouseManager wm = new WarehouseManager();
        wm.setId(15);

        GoodsReceptionDetailsResponse accepted = new GoodsReceptionDetailsResponse();
        accepted.setId(9);
        accepted.setStatus(ReceptionStatus.ACCEPTED);

        when(userRepository.findByUserName("wm")).thenReturn(Optional.of(u));
        when(warehouseManagerRepository.findByUserId(11)).thenReturn(Optional.of(wm));
        when(goodsReceptionService.acceptReception(9, wm)).thenReturn(accepted);

        mockMvc.perform(post("/api/warehouse/receptions/9/accept")
                        .with(user("wm").roles("WAREHOUSE_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));

        verify(goodsReceptionService).acceptReception(9, wm);
    }
}
