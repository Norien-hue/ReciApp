package com.reciapp.api.controller;

import com.reciapp.api.dto.*;
import com.reciapp.api.service.UsuarioService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private static final Logger log = LoggerFactory.getLogger(UsuarioController.class);

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        log.info("[USUARIO] >>> POST /register - nombre: {}", req.getNombre());
        return ResponseEntity.status(HttpStatus.CREATED).body(service.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        log.info("[USUARIO] >>> POST /login - nombre: {}", req.getNombre());
        try {
            AuthResponse resp = service.login(req);
            log.info("[USUARIO] <<< Login OK para: {}", req.getNombre());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            log.error("[USUARIO] <<< Login FALLO para: {} - Error: {}", req.getNombre(), e.getMessage());
            throw e;
        }
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<UsuarioDto> getProfile(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getProfile(id));
    }

    @PutMapping("/{id}/nombre")
    public ResponseEntity<UsuarioDto> updateNombre(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateNombreRequest req) {
        return ResponseEntity.ok(service.updateNombre(id, req));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Map<String, String>> updatePassword(
            @PathVariable Integer id,
            @Valid @RequestBody UpdatePasswordRequest req) {
        service.updatePassword(id, req);
        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
    }

    @GetMapping("/by-tap/{tap}")
    public ResponseEntity<UsuarioDto> getByTap(@PathVariable Integer tap) {
        return ResponseEntity.ok(service.getByTap(tap));
    }

    @PutMapping("/{id}/tap")
    public ResponseEntity<UsuarioDto> requestTap(@PathVariable Integer id) {
        return ResponseEntity.ok(service.requestTap(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @PathVariable Integer id,
            @Valid @RequestBody DeleteAccountRequest req) {
        service.deleteAccount(id, req);
        return ResponseEntity.ok(Map.of("message", "Cuenta eliminada correctamente"));
    }
}
