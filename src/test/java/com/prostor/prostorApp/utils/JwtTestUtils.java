package com.prostor.prostorApp.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTestUtils {

    @Value("${app.jwt.secret:mySecretKeyForJWTGeneration2024WithStrongSecurity12345!@#$%}")
    private String jwtSecret;

    @Value("${app.jwt.expiration:86400000}")
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String generateAdminToken() {
        return generateToken("admin_user", "ADMIN");
    }

    public String generateCustomerToken() {
        return generateToken("john_doe", "CUSTOMER");
    }

    public String generateSellerToken() {
        return generateToken("seller_pro", "SELLER");
    }

    public String generateWarehouseManagerToken() {
        return generateToken("warehouse_mgr", "WAREHOUSE_MANAGER");
    }
}