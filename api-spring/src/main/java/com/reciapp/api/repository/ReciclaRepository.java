package com.reciapp.api.repository;

import com.reciapp.api.entity.Recicla;
import com.reciapp.api.entity.ReciclaId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReciclaRepository extends JpaRepository<Recicla, ReciclaId> {

    List<Recicla> findByIdUsuarioOrderByFechaDescHoraDesc(Integer idUsuario);

    long countByIdUsuarioAndTipoAndNumeroBarras(Integer idUsuario, String tipo, Long numeroBarras);
}
