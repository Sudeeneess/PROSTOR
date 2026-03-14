package com.prostor.prostorApp.modules.user.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponse {

    private int id;
    private String userName;
    private String contactPhone;
    private LocalDateTime createdAt;
    private RoleDto role;
}
