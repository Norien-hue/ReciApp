package com.reciapp.api.dto;

import com.reciapp.api.entity.Recicla;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class HistorialDto {
    private Integer idUsuario;
    private String tipo;
    private String numeroBarras;
    private String fecha;
    private String hora;
    private String productoNombre;
    private String productoMaterial;
    private Float emisionesReducibles;

    public static HistorialDto from(Recicla r) {
        return new HistorialDto(
            r.getIdUsuario(),
            r.getTipo(),
            String.valueOf(r.getNumeroBarras()),
            r.getFecha().toString(),
            r.getHora().toString(),
            r.getProducto() != null ? r.getProducto().getNombre() : null,
            r.getProducto() != null ? r.getProducto().getMaterial() : null,
            r.getProducto() != null ? r.getProducto().getEmisionesReducibles() : null
        );
    }
}
