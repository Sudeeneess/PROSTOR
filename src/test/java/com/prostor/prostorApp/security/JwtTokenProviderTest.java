package com.prostor.prostorApp.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("JwtTokenProvider")
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    private final String testSecret = "mySuperLongSecretKeyForJWTGeneration2024WithStrongSecurityAtLeast512BitsForHS512Algorithm!@#$%";
    private final long testExpiration = 3600000L;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", testSecret);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", testExpiration);
    }

    @Nested
    @DisplayName("generateToken")
    class GenerateToken {

        @Test
        @DisplayName("Should create valid token")
        void shouldCreateValidToken() {
            String token = jwtTokenProvider.generateToken("testuser", "ADMIN");

            assertNotNull(token);
            assertFalse(token.isEmpty());
            assertTrue(jwtTokenProvider.validateToken(token));
        }
    }

    @Nested
    @DisplayName("getUsernameFromToken")
    class GetUsernameFromToken {

        @Test
        @DisplayName("Should return correct username")
        void shouldReturnCorrectUsername() {
            String username = "testuser";
            String token = jwtTokenProvider.generateToken(username, "CUSTOMER");

            String extracted = jwtTokenProvider.getUsernameFromToken(token);

            assertEquals(username, extracted);
        }
    }

    @Nested
    @DisplayName("getRoleFromToken")
    class GetRoleFromToken {

        @Test
        @DisplayName("Should return correct role")
        void shouldReturnCorrectRole() {
            String role = "SELLER";
            String token = jwtTokenProvider.generateToken("testuser", role);

            String extracted = jwtTokenProvider.getRoleFromToken(token);

            assertEquals(role, extracted);
        }
    }

    @Nested
    @DisplayName("validateToken(String)")
    class ValidateTokenByString {

        @Test
        @DisplayName("Should return true for valid token")
        void shouldReturnTrueForValidToken() {
            String token = jwtTokenProvider.generateToken("user", "ADMIN");

            assertTrue(jwtTokenProvider.validateToken(token));
        }

        @Test
        @DisplayName("Should return false for invalid token")
        void shouldReturnFalseForInvalidToken() {
            assertFalse(jwtTokenProvider.validateToken("invalid.token.string"));
        }

        @Test
        @DisplayName("Should return false for null token")
        void shouldReturnFalseForNullToken() {
            assertFalse(jwtTokenProvider.validateToken(null));
        }

        @Test
        @DisplayName("Should return false for empty token")
        void shouldReturnFalseForEmptyToken() {
            assertFalse(jwtTokenProvider.validateToken(""));
        }

        @Test
        @DisplayName("Should return false for expired token")
        void shouldReturnFalseForExpiredToken() {
            ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", -1000L);
            String token = jwtTokenProvider.generateToken("user", "ADMIN");

            assertFalse(jwtTokenProvider.validateToken(token));
        }
    }

    @Nested
    @DisplayName("validateToken(String, UserDetails)")
    class ValidateTokenWithUserDetails {

        @Test
        @DisplayName("Should return true when username matches and token not expired")
        void shouldReturnTrueWhenUsernameMatches() {
            String username = "testuser";
            String token = jwtTokenProvider.generateToken(username, "ADMIN");
            UserDetails userDetails = new User(username, "password",
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")));

            assertTrue(jwtTokenProvider.validateToken(token, userDetails));
        }

        @Test
        @DisplayName("Should return false when username does not match")
        void shouldReturnFalseWhenUsernameDiffers() {
            String token = jwtTokenProvider.generateToken("testuser", "ADMIN");
            UserDetails userDetails = new User("different_user", "password", Collections.emptyList());

            assertFalse(jwtTokenProvider.validateToken(token, userDetails));
        }
    }

    @Nested
    @DisplayName("getExpirationMs")
    class GetExpirationMs {

        @Test
        @DisplayName("Should return configured expiration value")
        void shouldReturnConfiguredExpiration() {
            assertEquals(testExpiration, jwtTokenProvider.getExpirationMs());
        }
    }
}