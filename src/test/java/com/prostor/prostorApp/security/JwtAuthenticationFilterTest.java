package com.prostor.prostorApp.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.IOException;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtAuthenticationFilter")
class JwtAuthenticationFilterTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @Nested
    @DisplayName("doFilterInternal")
    class DoFilterInternal {

        @Test
        @DisplayName("Should not set authentication when Authorization header is missing")
        void shouldNotSetAuthenticationWhenAuthHeaderMissing() throws ServletException, IOException {
            when(request.getHeader("Authorization")).thenReturn(null);

            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            assertNull(SecurityContextHolder.getContext().getAuthentication());
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("Should not set authentication when Bearer token is invalid")
        void shouldNotSetAuthenticationWhenTokenInvalid() throws ServletException, IOException {
            String token = "invalid.token";
            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtTokenProvider.validateToken(token)).thenReturn(false);

            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            assertNull(SecurityContextHolder.getContext().getAuthentication());
            verify(filterChain).doFilter(request, response);
            verify(jwtTokenProvider, never()).getUsernameFromToken(any());
        }

        @Test
        @DisplayName("Should set authentication when Bearer token is valid")
        void shouldSetAuthenticationWhenTokenValid() throws ServletException, IOException {
            String token = "valid.jwt.token";
            String username = "admin_user";
            UserDetails userDetails = new User(username, "password",
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")));

            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtTokenProvider.validateToken(token)).thenReturn(true);
            when(jwtTokenProvider.getUsernameFromToken(token)).thenReturn(username);
            when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);

            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            assertNotNull(SecurityContextHolder.getContext().getAuthentication());
            assertEquals(username, SecurityContextHolder.getContext().getAuthentication().getName());
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("Should continue chain when exception occurs during token processing")
        void shouldContinueChainWhenExceptionOccurs() throws ServletException, IOException {
            String token = "valid.jwt.token";
            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtTokenProvider.validateToken(token)).thenThrow(new RuntimeException("Token error"));

            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            assertNull(SecurityContextHolder.getContext().getAuthentication());
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("Should not extract token when Authorization header lacks Bearer prefix")
        void shouldNotExtractTokenWithoutBearerPrefix() throws ServletException, IOException {
            when(request.getHeader("Authorization")).thenReturn("Basic dXNlcjpwYXNz");

            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            assertNull(SecurityContextHolder.getContext().getAuthentication());
            verify(jwtTokenProvider, never()).validateToken(any());
            verify(filterChain).doFilter(request, response);
        }
    }
}