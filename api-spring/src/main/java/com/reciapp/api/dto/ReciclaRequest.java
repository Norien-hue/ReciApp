package com.reciapp.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReciclaRequest {
    @NotNull
    private Integer idUsuario;
    @NotBlank
    private String tipo;
    @NotBlank
    private String numeroBarras;
}
