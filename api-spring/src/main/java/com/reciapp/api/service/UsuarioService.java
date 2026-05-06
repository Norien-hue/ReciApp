package com.reciapp.api.service;

import com.reciapp.api.dto.*;
import com.reciapp.api.entity.Usuario;
import com.reciapp.api.repository.UsuarioRepository;
import com.reciapp.api.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
}
