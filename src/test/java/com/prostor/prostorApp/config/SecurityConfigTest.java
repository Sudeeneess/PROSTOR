package com.prostor.prostorApp.config;

import com.prostor.prostorApp.modules.user.model.Seller;
import com.prostor.prostorApp.modules.user.model.User;
import com.prostor.prostorApp.modules.user.repository.SellerRepository;
import com.prostor.prostorApp.modules.user.repository.UserRepository;
import com.prostor.prostorApp.utils.JwtTestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("SecurityConfig")
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTestUtils jwtTestUtils;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SellerRepository sellerRepository;

    private static final String TEST_PASSWORD = "test123";

    @BeforeEach
    void setUp() {
        resetUserPassword("admin_user");
        resetUserPassword("john_doe");
        resetUserPassword("seller_pro");

        User sellerUser = userRepository.findByUserName("seller_pro").orElseThrow();
        sellerRepository.findByUserId(sellerUser.getId()).ifPresentOrElse(
                s -> System.out.println("Seller record exists"),
                () -> {
                    Seller seller = new Seller();
                    seller.setUser(sellerUser);
                    seller.setInn("123456789012");
                    seller.setCompanyName("ООО Продавец");
                    sellerRepository.save(seller);
                    System.out.println("Created seller record");
                }
        );
    }

    private void resetUserPassword(String username) {
        userRepository.findByUserName(username).ifPresent(user -> {
            user.setPasswordHash(passwordEncoder.encode(TEST_PASSWORD));
            userRepository.save(user);
        });
    }

    @Nested
    @DisplayName("Public endpoints")
    class PublicEndpoints {

        @Test
        @DisplayName("Should allow access to /api/products without authentication")
        void shouldAllowAccessToProducts() throws Exception {
            mockMvc.perform(get("/api/products")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should allow access to /api/categories without authentication")
        void shouldAllowAccessToCategories() throws Exception {
            mockMvc.perform(get("/api/categories")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should allow access to /api/brands without authentication")
        void shouldAllowAccessToBrands() throws Exception {
            mockMvc.perform(get("/api/brands")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should allow login with valid credentials")
        void shouldAllowLoginWithValidCredentials() throws Exception {
            mockMvc.perform(post("/api/auth/login")
                            .contentType("application/json")
                            .content("""
                                    {
                                        "username": "admin_user",
                                        "password": "%s"
                                    }
                                    """.formatted(TEST_PASSWORD)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").exists());
        }
    }

    @Nested
    @DisplayName("/api/admin/** endpoints")
    class AdminEndpoints {

        @Test
        @DisplayName("Should return 403 when unauthenticated")
        void shouldReturn403WhenUnauthenticated() throws Exception {
            mockMvc.perform(get("/api/admin/users"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Should allow access with ADMIN role")
        void shouldAllowAccessWithAdminRole() throws Exception {
            String token = jwtTestUtils.generateAdminToken();

            mockMvc.perform(get("/api/admin/users")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return 403 with CUSTOMER role")
        void shouldReturn403WithCustomerRole() throws Exception {
            String token = jwtTestUtils.generateCustomerToken();

            mockMvc.perform(get("/api/admin/users")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("/api/seller/** endpoints")
    class SellerEndpoints {

        @Test
        @DisplayName("Should allow access with SELLER role")
        void shouldAllowAccessWithSellerRole() throws Exception {
            System.out.println("\n=== SELLER TEST DEBUG START ===");

            User seller = userRepository.findByUserName("seller_pro").orElse(null);
            System.out.println("1. seller_pro user: " + (seller != null ? "FOUND (id=" + seller.getId() + ")" : "NOT FOUND"));

            if (seller != null) {
                System.out.println("   - role: " + (seller.getRole() != null ? seller.getRole().getName() : "NULL"));
                System.out.println("   - phone: " + seller.getContactPhone());
            }

            String token = jwtTestUtils.generateSellerToken();
            System.out.println("2. Token generated: " + token.substring(0, Math.min(30, token.length())) + "...");

            System.out.println("3. Sending request to /api/seller/products");

            mockMvc.perform(get("/api/seller/products")
                            .param("page", "0")
                            .param("size", "10")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                    .andDo(result -> {
                        System.out.println("4. Response status: " + result.getResponse().getStatus());
                        System.out.println("5. Response body: " + result.getResponse().getContentAsString());
                    })
                    .andExpect(status().isOk());

            System.out.println("=== SELLER TEST DEBUG END ===\n");
        }
    }

    @Nested
    @DisplayName("/api/customer/** endpoints")
    class CustomerEndpoints {

        @Test
        @DisplayName("Should allow access with CUSTOMER role")
        void shouldAllowAccessWithCustomerRole() throws Exception {
            String token = jwtTestUtils.generateCustomerToken();

            mockMvc.perform(get("/api/customer/dashboard")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return 403 with ADMIN role")
        void shouldReturn403WithAdminRole() throws Exception {
            String token = jwtTestUtils.generateAdminToken();

            mockMvc.perform(get("/api/customer/dashboard")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("CORS configuration")
    class CorsConfiguration {

        @Test
        @DisplayName("Should allow preflight from allowed origin")
        void shouldAllowPreflightFromAllowedOrigin() throws Exception {
            mockMvc.perform(options("/api/products")
                            .header("Access-Control-Request-Method", "GET")
                            .header("Origin", "http://localhost:3000"))
                    .andExpect(status().isOk())
                    .andExpect(header().exists("Access-Control-Allow-Origin"));
        }
    }
}