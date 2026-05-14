package com.reciapp.api.controller;

import com.reciapp.api.dto.ProductoDto;
import com.reciapp.api.service.ProductoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService service;

    public ProductoController(ProductoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ProductoDto>> getAll(Authentication auth) {
        Integer userId = (Integer) auth.getPrincipal();
        return ResponseEntity.ok(service.getAll(userId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductoDto>> search(
            @RequestParam(name = "q", defaultValue = "") String query,
            Authentication auth) {
        Integer userId = (Integer) auth.getPrincipal();
        return ResponseEntity.ok(service.search(query, userId));
    }

    @GetMapping("/barcode/{barras}")
    public ResponseEntity<ProductoDto> getByBarcode(
            @PathVariable Long barras,
            Authentication auth) {
        Integer userId = (Integer) auth.getPrincipal();
        return ResponseEntity.ok(service.getByBarcode(barras, userId));
    }

    @GetMapping("/{tipo}/{barras}")
    public ResponseEntity<ProductoDto> getOne(
            @PathVariable String tipo,
            @PathVariable Long barras,
            Authentication auth) {
        Integer userId = (Integer) auth.getPrincipal();
        return ResponseEntity.ok(service.getOne(tipo, barras, userId));
    }
}
