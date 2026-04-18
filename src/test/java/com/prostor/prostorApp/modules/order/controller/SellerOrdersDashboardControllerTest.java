package com.prostor.prostorApp.modules.order.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prostor.prostorApp.common.exception.GlobalExceptionHandler;
import com.prostor.prostorApp.modules.order.dto.SellerOrdersDashboardResponse;
import com.prostor.prostorApp.modules.order.service.SellerOrdersDashboardService;
import com.prostor.prostorApp.modules.user.controller.UserWebMvcTestSecurityConfig;
import com.prostor.prostorApp.modules.user.model.Seller;
import com.prostor.prostorApp.modules.user.model.User;
import com.prostor.prostorApp.modules.user.repository.SellerRepository;
import com.prostor.prostorApp.modules.user.repository.UserRepository;
import com.prostor.prostorApp.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = SellerOrdersDashboardController.class,
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
        UserWebMvcTestSecurityConfig.class
})
@DisplayName("Seller Orders Dashboard Controller")
class SellerOrdersDashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SellerOrdersDashboardService sellerOrdersDashboardService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private SellerRepository sellerRepository;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/seller/orders/dashboard should return counters for seller")
    void getSellerOrdersDashboard_ShouldReturnCounters() throws Exception {
        User userEntity = new User();
        userEntity.setId(5);
        Seller seller = new Seller();
        seller.setId(99);
        seller.setUser(userEntity);

        when(userRepository.findByUserName("seller_pro")).thenReturn(Optional.of(userEntity));
        when(sellerRepository.findByUserId(5)).thenReturn(Optional.of(seller));
        when(sellerOrdersDashboardService.getDashboard(eq(99)))
                .thenReturn(new SellerOrdersDashboardResponse(12, 5, 8, 41));

        String json = mockMvc.perform(get("/api/seller/orders/dashboard")
                        .with(user("seller_pro").roles("SELLER")))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode root = objectMapper.readTree(json);
        assertEquals(12, root.get("newProducts").asInt());
        assertEquals(5, root.get("assembling").asInt());
        assertEquals(8, root.get("onTheWay").asInt());
        assertEquals(41, root.get("sold").asInt());
    }
}
