package com.reciapp.api.dto;

import com.reciapp.api.entity.Usuario;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UsuarioDto {
    private Integer id;
    private String nombre;
    private String permisos;
    private Float emisionesReducidas;
    private Integer tap;

    public static UsuarioDto from(Usuario u) {
        return new UsuarioDto(
            u.getId(),
            u.getNombre(),
            u.getPermisos(),
            u.getEmisionesReducidas() != null ? u.getEmisionesReducidas() : 0f,
            u.getTap()
        );
    }
}
