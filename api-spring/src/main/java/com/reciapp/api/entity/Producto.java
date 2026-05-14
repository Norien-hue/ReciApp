package com.reciapp.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "Productos")
@IdClass(ProductoId.class)
@Getter
@Setter
public class Producto {

    @Id
    @Column(name = "Tipo", length = 10)
    private String tipo;

    @Id
    @Column(name = "Numero_barras")
    private Long numeroBarras;

    @Column(name = "Nombre", length = 50)
    private String nombre;

    @Column(name = "Emisiones_Reducibles")
    private Float emisionesReducibles;

    @Column(name = "Material", length = 15)
    private String material;

    @Lob
    @Column(name = "Imagen", columnDefinition = "LONGTEXT")
    private String imagen;
}
