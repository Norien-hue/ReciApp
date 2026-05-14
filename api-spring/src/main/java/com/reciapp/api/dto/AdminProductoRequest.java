package com.reciapp.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductoRequest {
    @NotBlank
    private String tipo;
    @NotNull
    private Long numeroBarras;
    @NotBlank
    private String nombre;
    @NotNull
    private Float emisionesReducibles;
    @NotBlank
    private String material;
    private String imagen; // base64, puede ser null
}
