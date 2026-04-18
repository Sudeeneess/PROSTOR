package com.prostor.prostorApp.modules.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private String username;
    private String role;
    private Long expiresIn;
    private Integer customerId;
    private Integer adminId;
    private Integer sellerId;
    private Integer warehouseManagerId;
}
