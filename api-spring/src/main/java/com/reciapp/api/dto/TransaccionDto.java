package com.reciapp.api.dto;

import com.reciapp.api.entity.Recicla;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@AllArgsConstructor
public class TransaccionDto {
    private Integer idUsuario;
    private String tipo;
    private Long numeroBarras;
    private LocalDate fecha;
    private LocalTime hora;

    public static TransaccionDto from(Recicla r) {
        return new TransaccionDto(
            r.getIdUsuario(),
            r.getTipo(),
            r.getNumeroBarras(),
            r.getFecha(),
            r.getHora()
        );
    }
}
