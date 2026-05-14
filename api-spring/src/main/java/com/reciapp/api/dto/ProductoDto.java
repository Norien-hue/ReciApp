package com.reciapp.api.dto;

import com.reciapp.api.entity.Producto;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProductoDto {
    private String tipo;
    private String numeroBarras;
    private String nombre;
    private Float emisionesReducibles;
    private String material;
    private String imagen;
    private Long vecesReciclado;

    public static ProductoDto from(Producto p, long vecesReciclado) {
        return new ProductoDto(
            p.getTipo(),
            String.valueOf(p.getNumeroBarras()),
            p.getNombre(),
            p.getEmisionesReducibles(),
            p.getMaterial(),
            p.getImagen(),
            vecesReciclado
        );
    }
}
