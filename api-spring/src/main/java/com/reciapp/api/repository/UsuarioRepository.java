package com.reciapp.api.repository;

import com.reciapp.api.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByNombre(String nombre);
    boolean existsByNombre(String nombre);
    Optional<Usuario> findByTap(Integer tap);
}
