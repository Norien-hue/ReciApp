package com.reciapp.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReciclaResponse {
    private String message;
    private HistorialDto reciclaje;
    private Float emisionesAcumuladas;
}
