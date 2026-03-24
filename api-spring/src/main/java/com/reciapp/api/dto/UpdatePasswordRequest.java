package com.reciapp.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdatePasswordRequest {
    @NotBlank
    private String passwordActual;
    @NotBlank
    @Size(min = 4)
    private String passwordNueva;
}
