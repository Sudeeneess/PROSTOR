package com.prostor.prostorApp.modules.user.controller;

import com.prostor.prostorApp.common.exception.GlobalExceptionHandler;
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

import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = WarehouseManagerController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class,
                UserDetailsServiceAutoConfiguration.class
        },
        properties = "spring.autoconfigure.exclude=org.springframework.boot.test.autoconfigure.web.servlet.MockMvcSecurityConfiguration"
)
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalExceptionHandler.class, UserWebMvcTestSecurityConfig.class})
@DisplayName("WarehouseManagerController")
class WarehouseManagerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/warehouse/dashboard returns payload for warehouse manager principal")
    void dashboard_ok() throws Exception {
        mockMvc.perform(get("/api/warehouse/dashboard").with(user("wm1").roles("WAREHOUSE_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role", is("WAREHOUSE_MANAGER")))
                .andExpect(jsonPath("$.username", is("wm1")))
                .andExpect(jsonPath("$.status", is("ready")))
                .andExpect(jsonPath("$.redirect", is("/warehouse/dashboard")));
    }
}
