package com.reciapp.api.service;

import com.reciapp.api.dto.*;
import com.reciapp.api.entity.Usuario;
import com.reciapp.api.repository.UsuarioRepository;
import com.reciapp.api.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Random;

@Service
public class UsuarioService {

    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public UsuarioService(UsuarioRepository repo, PasswordEncoder encoder, JwtService jwtService) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest req) {
        if (repo.existsByNombre(req.getNombre())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El nombre de usuario ya existe");
        }

        var user = new Usuario();
        user.setNombre(req.getNombre());
        user.setHashContrasena(encoder.encode(req.getPassword()));
        user.setPermisos("cliente");
        user.setEmisionesReducidas(0f);
        user = repo.save(user);

        String token = jwtService.generateToken(user.getId(), user.getNombre(), user.getPermisos());
        return new AuthResponse(token, UsuarioDto.from(user));
    }

    public AuthResponse login(LoginRequest req) {
        var user = repo.findByNombre(req.getNombre())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas"));

        if (!encoder.matches(req.getPassword(), user.getHashContrasena())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas");
        }

        String token = jwtService.generateToken(user.getId(), user.getNombre(), user.getPermisos());
        return new AuthResponse(token, UsuarioDto.from(user));
    }

    public UsuarioDto getProfile(Integer id) {
        var user = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        return UsuarioDto.from(user);
    }

    public UsuarioDto getByTap(Integer tap) {
        var user = repo.findByTap(tap)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró usuario con ese TAP"));
        return UsuarioDto.from(user);
    }

    public UsuarioDto updateNombre(Integer id, UpdateNombreRequest req) {
        var user = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (!encoder.matches(req.getPasswordActual(), user.getHashContrasena())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contraseña actual incorrecta");
        }

        // Comprobar duplicado
        repo.findByNombre(req.getNuevoNombre()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El nombre de usuario ya existe");
            }
        });

        user.setNombre(req.getNuevoNombre());
        user = repo.save(user);
        return UsuarioDto.from(user);
    }

    public void updatePassword(Integer id, UpdatePasswordRequest req) {
        var user = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (!encoder.matches(req.getPasswordActual(), user.getHashContrasena())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contraseña actual incorrecta");
        }

        user.setHashContrasena(encoder.encode(req.getPasswordNueva()));
        repo.save(user);
    }

    public void deleteAccount(Integer id, DeleteAccountRequest req) {
        var user = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (!encoder.matches(req.getPassword(), user.getHashContrasena())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contraseña incorrecta");
        }

        repo.delete(user);
    }

    /**
     * Genera un TAP único de 6 dígitos para el usuario.
     * Si el usuario ya tiene TAP se reemplaza por uno nuevo.
     */
    public UsuarioDto requestTap(Integer id) {
        var user = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        Random rng = new Random();
        int tap;
        int attempts = 0;
        do {
            // TAP: número de 6 dígitos (100000 – 999999)
            tap = 100_000 + rng.nextInt(900_000);
            attempts++;
            if (attempts > 20) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "No se pudo generar un TAP único. Inténtalo de nuevo.");
            }
        } while (repo.existsByTap(tap));

        user.setTap(tap);
        user = repo.save(user);
        return UsuarioDto.from(user);
    }
}
