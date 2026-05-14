package com.reciapp.api.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUpdateUsuarioRequest {
    private String nombre;
    private String permisos;
    private Integer tap;
    private Float emisionesReducidas;
}
