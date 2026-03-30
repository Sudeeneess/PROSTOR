package com.prostor.prostorApp.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;


@Data
public class RegisterRequest {
    @NotBlank(message = "Имя пользователя обязательно")
    @Size(min = 3, max = 25, message = "Имя пользователя должно быть от 3 до 25 символов")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Имя пользователя может содержать только буквы, цифры и подчеркивание")
    private String username;

    @NotBlank(message = "Пароль обязателен")
    @Size(min = 6, max = 60, message = "Пароль должен быть от 6 до 60 символов")
    private String password;

    @NotBlank(message = "Телефон обязателен")
    @Pattern(regexp = "^\\d{11}$", message = "Телефон должен содержать 11 цифр")
    private String phone;

    @NotBlank(message = "Роль обязательна")
    @Pattern(regexp = "^(CUSTOMER|SELLER)$", message = "Роль должна быть CUSTOMER или SELLER")
    private String role;

    @Size(min = 10, max = 12, message = "ИНН должен быть 10-12 цифр")
    @Pattern(regexp = "^\\d{10,12}$", message = "ИНН должен содержать только цифры")
    private String inn;

    @Size(max = 50, message = "Название компании не должно превышать 50 символов")
    private String companyName;
}
