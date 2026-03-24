package com.reciapp.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateNombreRequest {
    @NotBlank
    private String nuevoNombre;
    @NotBlank
    private String passwordActual;
}
