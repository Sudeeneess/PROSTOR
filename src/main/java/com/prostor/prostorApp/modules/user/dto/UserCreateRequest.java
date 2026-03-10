package com.prostor.prostorApp.modules.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserCreateRequest {

    @NotBlank
    @Size(max=25)
    private String userName;

    @NotBlank
    @Size(max = 60)
    private String password;

    @NotBlank
    @Pattern(regexp= "\\d{11}")
    private String contactPhone;

    private int roleId;
}
