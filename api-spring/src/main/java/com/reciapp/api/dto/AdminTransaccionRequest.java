package com.reciapp.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class AdminTransaccionRequest {
    @NotNull
    private Integer idUsuario;
    @NotBlank
    private String tipo;
    @NotNull
    private Long numeroBarras;
    @NotNull
    private LocalDate fecha;
    @NotNull
    private LocalTime hora;
}
