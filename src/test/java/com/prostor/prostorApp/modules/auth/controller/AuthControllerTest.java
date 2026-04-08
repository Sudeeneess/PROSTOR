package com.prostor.prostorApp.modules.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prostor.prostorApp.modules.auth.dto.LoginRequest;
import com.prostor.prostorApp.modules.auth.dto.RegisterRequest;
import com.prostor.prostorApp.modules.user.model.User;
import com.prostor.prostorApp.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Sql(scripts = "/db/cleanup.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@DisplayName("AuthController")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String TEST_PASSWORD = "test123";

    @BeforeEach
    void setUp() {
        resetPassword("admin_user");
        resetPassword("john_doe");
        resetPassword("seller_pro");
    }

    private void resetPassword(String username) {
        userRepository.findByUserName(username).ifPresent(user -> {
            user.setPasswordHash(passwordEncoder.encode(TEST_PASSWORD));
            userRepository.save(user);
        });
    }

    @Nested
    @DisplayName("POST /api/auth/login")
    class LoginApi {

        @Test
        @DisplayName("Should return 200 and token for valid admin credentials")
        void shouldReturnTokenForValidAdmin() throws Exception {
            LoginRequest request = new LoginRequest();
            request.setUsername("admin_user");
            request.setPassword(TEST_PASSWORD);

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").exists())
                    .andExpect(jsonPath("$.username").value("admin_user"))
                    .andExpect(jsonPath("$.role").value("ADMIN"));
        }

        @Test
        @DisplayName("Should return 200 and token for valid customer credentials")
        void shouldReturnTokenForValidCustomer() throws Exception {
            LoginRequest request = new LoginRequest();
            request.setUsername("john_doe");
            request.setPassword(TEST_PASSWORD);

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").exists())
                    .andExpect(jsonPath("$.username").value("john_doe"))
                    .andExpect(jsonPath("$.role").value("CUSTOMER"));
        }

        @Test
        @DisplayName("Should return 200 and token for valid seller credentials")
        void shouldReturnTokenForValidSeller() throws Exception {
            LoginRequest request = new LoginRequest();
            request.setUsername("seller_pro");
            request.setPassword(TEST_PASSWORD);

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").exists())
                    .andExpect(jsonPath("$.username").value("seller_pro"))
                    .andExpect(jsonPath("$.role").value("SELLER"));
        }

        @Test
        @DisplayName("Should return 401 when password is incorrect")
        void shouldReturn401WhenPasswordIncorrect() throws Exception {
            LoginRequest request = new LoginRequest();
            request.setUsername("admin_user");
            request.setPassword("wrong_password");

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should return 401 when user does not exist")
        void shouldReturn401WhenUserNotFound() throws Exception {
            LoginRequest request = new LoginRequest();
            request.setUsername("nonexistent_user");
            request.setPassword("any_password");

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should return 400 when username is blank")
        void shouldReturn400WhenUsernameBlank() throws Exception {
            LoginRequest request = new LoginRequest();
            request.setUsername("");
            request.setPassword(TEST_PASSWORD);

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when password is blank")
        void shouldReturn400WhenPasswordBlank() throws Exception {
            LoginRequest request = new LoginRequest();
            request.setUsername("admin_user");
            request.setPassword("");

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/register")
    class RegisterApi {

        @Test
        @DisplayName("Should return 201 when registering valid CUSTOMER")
        void shouldReturn201ForValidCustomer() throws Exception {
            RegisterRequest request = new RegisterRequest();
            request.setUsername("testcustomer");
            request.setPassword("password123");
            request.setPhone("99988877766");
            request.setRole("CUSTOMER");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.username").value("testcustomer"))
                    .andExpect(jsonPath("$.role").value("CUSTOMER"));
        }

        @Test
        @DisplayName("Should return 201 when registering valid SELLER")
        void shouldReturn201ForValidSeller() throws Exception {
            RegisterRequest request = new RegisterRequest();
            request.setUsername("testseller");
            request.setPassword("password123");
            request.setPhone("88877766655");
            request.setRole("SELLER");
            request.setInn("987654321098");
            request.setCompanyName("Тестовая Компания");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.username").value("testseller"))
                    .andExpect(jsonPath("$.role").value("SELLER"));
        }

        @Test
        @DisplayName("Should return 400 when username already exists")
        void shouldReturn400WhenUsernameExists() throws Exception {
            RegisterRequest request = new RegisterRequest();
            request.setUsername("admin_user");
            request.setPassword("password123");
            request.setPhone("77777777777");
            request.setRole("CUSTOMER");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when phone already exists")
        void shouldReturn400WhenPhoneExists() throws Exception {
            RegisterRequest request = new RegisterRequest();
            request.setUsername("newuser");
            request.setPassword("password123");
            request.setPhone("22222222222");
            request.setRole("CUSTOMER");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when username is too short")
        void shouldReturn400WhenUsernameTooShort() throws Exception {
            RegisterRequest request = new RegisterRequest();
            request.setUsername("ab");
            request.setPassword("password123");
            request.setPhone("77777777777");
            request.setRole("CUSTOMER");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when username contains invalid characters")
        void shouldReturn400WhenUsernameInvalid() throws Exception {
            RegisterRequest request = new RegisterRequest();
            request.setUsername("user@name");
            request.setPassword("password123");
            request.setPhone("77777777777");
            request.setRole("CUSTOMER");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when password is too short")
        void shouldReturn400WhenPasswordTooShort() throws Exception {
            RegisterRequest request = new RegisterRequest();
            request.setUsername("validuser");
            request.setPassword("12345");
            request.setPhone("77777777777");
            request.setRole("CUSTOMER");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when phone number is invalid")
        void shouldReturn400WhenPhoneInvalid() throws Exception {
            RegisterRequest request = new RegisterRequest();
            request.setUsername("validuser");
            request.setPassword("password123");
            request.setPhone("12345");
            request.setRole("CUSTOMER");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when SELLER has no INN")
        void shouldReturn400WhenSellerHasNoInn() throws Exception {
            RegisterRequest request = new RegisterRequest();
            request.setUsername("seller_no_inn");
            request.setPassword("password123");
            request.setPhone("77777777777");
            request.setRole("SELLER");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when SELLER has no company name")
        void shouldReturn400WhenSellerHasNoCompanyName() throws Exception {
            RegisterRequest request = new RegisterRequest();
            request.setUsername("seller_no_company");
            request.setPassword("password123");
            request.setPhone("77777777777");
            request.setRole("SELLER");
            request.setInn("123456789012");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when registering as ADMIN")
        void shouldReturn400WhenRegisteringAdmin() throws Exception {
            RegisterRequest request = new RegisterRequest();
            request.setUsername("newadmin");
            request.setPassword("password123");
            request.setPhone("77777777777");
            request.setRole("ADMIN");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when registering as WAREHOUSE_MANAGER")
        void shouldReturn400WhenRegisteringWarehouseManager() throws Exception {
            RegisterRequest request = new RegisterRequest();
            request.setUsername("newmanager");
            request.setPassword("password123");
            request.setPhone("77777777777");
            request.setRole("WAREHOUSE_MANAGER");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }
}