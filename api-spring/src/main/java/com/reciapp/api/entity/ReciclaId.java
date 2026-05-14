package com.reciapp.api.entity;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ReciclaId implements Serializable {
    private Integer idUsuario;
    private String tipo;
    private Long numeroBarras;
    private LocalDate fecha;
    private LocalTime hora;
}
