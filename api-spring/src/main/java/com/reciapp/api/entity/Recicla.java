package com.reciapp.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "Recicla")
@IdClass(ReciclaId.class)
@Getter
@Setter
public class Recicla {

    @Id
    @Column(name = "Id_Usuario")
    private Integer idUsuario;

    @Id
    @Column(name = "Tipo", length = 10)
    private String tipo;

    @Id
    @Column(name = "Numero_barras")
    private Long numeroBarras;

    @Id
    @Column(name = "Fecha")
    private LocalDate fecha;

    @Id
    @Column(name = "Hora")
    private LocalTime hora;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Id_Usuario", insertable = false, updatable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
        @JoinColumn(name = "Tipo", referencedColumnName = "Tipo", insertable = false, updatable = false),
        @JoinColumn(name = "Numero_barras", referencedColumnName = "Numero_barras", insertable = false, updatable = false)
    })
    private Producto producto;
}
