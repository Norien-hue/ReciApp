package com.reciapp.api.controller;

import com.reciapp.api.dto.*;
import com.reciapp.api.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ═══════════════════════════════════════
    // USUARIOS
    // ═══════════════════════════════════════

    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioDto>> getAllUsuarios() {
        return ResponseEntity.ok(adminService.getAllUsuarios());
    }

    @PostMapping("/usuarios")
    public ResponseEntity<UsuarioDto> createUsuario(@Valid @RequestBody AdminCreateUsuarioRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createUsuario(req));
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<UsuarioDto> updateUsuario(@PathVariable Integer id,
                                                     @Valid @RequestBody AdminUpdateUsuarioRequest req) {
        return ResponseEntity.ok(adminService.updateUsuario(id, req));
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Map<String, String>> deleteUsuario(@PathVariable Integer id) {
        adminService.deleteUsuario(id);
        return ResponseEntity.ok(Map.of("message", "Usuario eliminado correctamente"));
    }

    // ═══════════════════════════════════════
    // PRODUCTOS
    // ═══════════════════════════════════════

    @GetMapping("/productos")
    public ResponseEntity<List<ProductoDto>> getAllProductos() {
        return ResponseEntity.ok(adminService.getAllProductos());
    }

    @PostMapping("/productos")
    public ResponseEntity<ProductoDto> createProducto(@Valid @RequestBody AdminProductoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createProducto(req));
    }

    @PutMapping("/productos/{tipo}/{barras}")
    public ResponseEntity<ProductoDto> updateProducto(@PathVariable String tipo,
                                                       @PathVariable Long barras,
                                                       @Valid @RequestBody AdminProductoRequest req) {
        return ResponseEntity.ok(adminService.updateProducto(tipo, barras, req));
    }

    @DeleteMapping("/productos/{tipo}/{barras}")
    public ResponseEntity<Map<String, String>> deleteProducto(@PathVariable String tipo,
                                                                @PathVariable Long barras) {
        adminService.deleteProducto(tipo, barras);
        return ResponseEntity.ok(Map.of("message", "Producto eliminado correctamente"));
    }

    // ═══════════════════════════════════════
    // TRANSACCIONES
    // ═══════════════════════════════════════

    @GetMapping("/transacciones")
    public ResponseEntity<List<TransaccionDto>> getAllTransacciones() {
        return ResponseEntity.ok(adminService.getAllTransacciones());
    }

    @PostMapping("/transacciones")
    public ResponseEntity<TransaccionDto> createTransaccion(@Valid @RequestBody AdminTransaccionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createTransaccion(req));
    }

    @DeleteMapping("/transacciones")
    public ResponseEntity<Map<String, String>> deleteTransaccion(@Valid @RequestBody AdminTransaccionRequest req) {
        adminService.deleteTransaccion(req);
        return ResponseEntity.ok(Map.of("message", "Transaccion eliminada correctamente"));
    }
}
