package com.reciapp.api.service;

import com.reciapp.api.dto.*;
import com.reciapp.api.entity.*;
import com.reciapp.api.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdminService {

    private final UsuarioRepository usuarioRepo;
    private final ProductoRepository productoRepo;
    private final ReciclaRepository reciclaRepo;
    private final PasswordEncoder encoder;

    public AdminService(UsuarioRepository usuarioRepo, ProductoRepository productoRepo,
                        ReciclaRepository reciclaRepo, PasswordEncoder encoder) {
        this.usuarioRepo = usuarioRepo;
        this.productoRepo = productoRepo;
        this.reciclaRepo = reciclaRepo;
        this.encoder = encoder;
    }

    // ═══════════════════════════════════════
    // USUARIOS
    // ═══════════════════════════════════════

    public List<UsuarioDto> getAllUsuarios() {
        return usuarioRepo.findAll().stream()
                .map(UsuarioDto::from)
                .toList();
    }

    public UsuarioDto createUsuario(AdminCreateUsuarioRequest req) {
        if (usuarioRepo.existsByNombre(req.getNombre())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El nombre de usuario ya existe");
        }

        var user = new Usuario();
        user.setNombre(req.getNombre());
        user.setHashContrasena(encoder.encode(req.getPassword()));
        user.setPermisos(req.getPermisos());
        user.setEmisionesReducidas(0f);
        user = usuarioRepo.save(user);
        return UsuarioDto.from(user);
    }

    public UsuarioDto updateUsuario(Integer id, AdminUpdateUsuarioRequest req) {
        var user = usuarioRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (req.getNombre() != null) {
            // Comprobar duplicado
            usuarioRepo.findByNombre(req.getNombre()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "El nombre de usuario ya existe");
                }
            });
            user.setNombre(req.getNombre());
        }
        if (req.getPermisos() != null) {
            user.setPermisos(req.getPermisos());
        }
        if (req.getTap() != null) {
            user.setTap(req.getTap());
        }
        if (req.getEmisionesReducidas() != null) {
            user.setEmisionesReducidas(req.getEmisionesReducidas());
        }

        user = usuarioRepo.save(user);
        return UsuarioDto.from(user);
    }

    @Transactional
    public void deleteUsuario(Integer id) {
        var user = usuarioRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        // Borrar todas las transacciones del usuario
        reciclaRepo.deleteByIdUsuario(id);
        // Borrar el usuario
        usuarioRepo.delete(user);
    }

    // ═══════════════════════════════════════
    // PRODUCTOS
    // ═══════════════════════════════════════

    public List<ProductoDto> getAllProductos() {
        return productoRepo.findAll().stream()
                .map(p -> ProductoDto.from(p, 0))
                .toList();
    }

    public ProductoDto createProducto(AdminProductoRequest req) {
        var pid = new ProductoId(req.getTipo(), req.getNumeroBarras());
        if (productoRepo.existsById(pid)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un producto con tipo=" + req.getTipo() + " y barras=" + req.getNumeroBarras());
        }

        var producto = new Producto();
        producto.setTipo(req.getTipo());
        producto.setNumeroBarras(req.getNumeroBarras());
        producto.setNombre(req.getNombre());
        producto.setEmisionesReducibles(req.getEmisionesReducibles());
        producto.setMaterial(req.getMaterial());
        producto.setImagen(req.getImagen());
        producto = productoRepo.save(producto);
        return ProductoDto.from(producto, 0);
    }

    public ProductoDto updateProducto(String tipo, Long barras, AdminProductoRequest req) {
        var pid = new ProductoId(tipo, barras);
        var producto = productoRepo.findById(pid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

        if (req.getNombre() != null) producto.setNombre(req.getNombre());
        if (req.getEmisionesReducibles() != null) producto.setEmisionesReducibles(req.getEmisionesReducibles());
        if (req.getMaterial() != null) producto.setMaterial(req.getMaterial());
        // imagen puede ser null (para borrarla) — siempre se actualiza si viene en el body
        producto.setImagen(req.getImagen());

        producto = productoRepo.save(producto);
        return ProductoDto.from(producto, 0);
    }

    @Transactional
    public void deleteProducto(String tipo, Long barras) {
        var pid = new ProductoId(tipo, barras);
        var producto = productoRepo.findById(pid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

        // Restar emisiones a los usuarios que reciclaron este producto
        var transacciones = reciclaRepo.findByTipoAndNumeroBarras(tipo, barras);
        for (Recicla r : transacciones) {
            var user = usuarioRepo.findById(r.getIdUsuario()).orElse(null);
            if (user != null) {
                float nuevas = (user.getEmisionesReducidas() != null ? user.getEmisionesReducidas() : 0f)
                        - (producto.getEmisionesReducibles() != null ? producto.getEmisionesReducibles() : 0f);
                user.setEmisionesReducidas(Math.max(0f, nuevas));
                usuarioRepo.save(user);
            }
        }

        // Borrar transacciones del producto
        reciclaRepo.deleteByTipoAndNumeroBarras(tipo, barras);
        // Borrar el producto
        productoRepo.delete(producto);
    }

    // ═══════════════════════════════════════
    // TRANSACCIONES
    // ═══════════════════════════════════════

    public List<TransaccionDto> getAllTransacciones() {
        return reciclaRepo.findAll().stream()
                .map(TransaccionDto::from)
                .toList();
    }

    @Transactional
    public TransaccionDto createTransaccion(AdminTransaccionRequest req) {
        // Verificar que usuario y producto existen
        var user = usuarioRepo.findById(req.getIdUsuario())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        var pid = new ProductoId(req.getTipo(), req.getNumeroBarras());
        var producto = productoRepo.findById(pid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

        var recicla = new Recicla();
        recicla.setIdUsuario(req.getIdUsuario());
        recicla.setTipo(req.getTipo());
        recicla.setNumeroBarras(req.getNumeroBarras());
        recicla.setFecha(req.getFecha());
        recicla.setHora(req.getHora());
        recicla = reciclaRepo.save(recicla);

        // Sumar emisiones al usuario
        float emisiones = producto.getEmisionesReducibles() != null ? producto.getEmisionesReducibles() : 0f;
        float actuales = user.getEmisionesReducidas() != null ? user.getEmisionesReducidas() : 0f;
        user.setEmisionesReducidas(actuales + emisiones);
        usuarioRepo.save(user);

        return TransaccionDto.from(recicla);
    }

    @Transactional
    public void deleteTransaccion(AdminTransaccionRequest req) {
        var rid = new ReciclaId(req.getIdUsuario(), req.getTipo(), req.getNumeroBarras(),
                req.getFecha(), req.getHora());

        var recicla = reciclaRepo.findById(rid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaccion no encontrada"));

        // Restar emisiones al usuario
        var pid = new ProductoId(req.getTipo(), req.getNumeroBarras());
        productoRepo.findById(pid).ifPresent(producto -> {
            var user = usuarioRepo.findById(req.getIdUsuario()).orElse(null);
            if (user != null) {
                float emisiones = producto.getEmisionesReducibles() != null ? producto.getEmisionesReducibles() : 0f;
                float actuales = user.getEmisionesReducidas() != null ? user.getEmisionesReducidas() : 0f;
                user.setEmisionesReducidas(Math.max(0f, actuales - emisiones));
                usuarioRepo.save(user);
            }
        });

        reciclaRepo.delete(recicla);
    }
}
