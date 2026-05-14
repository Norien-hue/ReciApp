package com.reciapp.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "Usuarios")
@Getter
@Setter
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_Usuario")
    private Integer id;

    @Column(name = "Nombre", unique = true, nullable = false, length = 50)
    private String nombre;

    @Column(name = "Hash_Contraseña", nullable = false, length = 100)
    private String hashContrasena;

    @Column(name = "Permisos", length = 15)
    private String permisos;

    @Column(name = "Emisiones_Reducidas")
    private Float emisionesReducidas = 0f;

    @Column(name = "TAP")
    private Integer tap;
}
