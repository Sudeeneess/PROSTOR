package com.prostor.prostorApp.modules.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RoleDto {

    private int id;

    @NotBlank(message = "Название роли не может быть пустым")
    @Size(max = 50, message = "Название роли не должно превышать 50 символов")
    private String name;
}
