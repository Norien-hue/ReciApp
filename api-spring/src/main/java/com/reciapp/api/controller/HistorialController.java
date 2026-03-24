package com.reciapp.api.controller;

import com.reciapp.api.dto.HistorialDto;
import com.reciapp.api.service.ReciclaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historial")
public class HistorialController {

    private final ReciclaService service;

    public HistorialController(ReciclaService service) {
        this.service = service;
    }

    @GetMapping("/{idUsuario}")
    public ResponseEntity<List<HistorialDto>> getHistorial(@PathVariable Integer idUsuario) {
        return ResponseEntity.ok(service.getHistorial(idUsuario));
    }
}
