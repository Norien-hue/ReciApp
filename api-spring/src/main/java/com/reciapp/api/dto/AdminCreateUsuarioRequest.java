package com.reciapp.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCreateUsuarioRequest {
    @NotBlank
    private String nombre;
    @NotBlank
    private String password;
    @NotBlank
    private String permisos; // "cliente" o "administrador"
}
