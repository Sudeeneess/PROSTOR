package com.prostor.prostorApp.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private String username;
    private String role;
    private Long expiresIn;
    private String redirectUrl;

    public LoginResponse(String token, String username, String role, Long expiresIn, String redirectUrl) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.expiresIn = expiresIn;
        this.redirectUrl = redirectUrl;
    }
}