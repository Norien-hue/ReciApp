package com.reciapp.api.service;

import com.reciapp.api.dto.HistorialDto;
import com.reciapp.api.repository.ReciclaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReciclaService {

    private final ReciclaRepository repo;

    public ReciclaService(ReciclaRepository repo) {
        this.repo = repo;
    }

    public List<HistorialDto> getHistorial(Integer idUsuario) {
        return repo.findByIdUsuarioOrderByFechaDescHoraDesc(idUsuario).stream()
            .map(HistorialDto::from)
            .toList();
    }
}
