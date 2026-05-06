package com.reciapp.api.service;

import com.reciapp.api.dto.HistorialDto;
import com.reciapp.api.dto.ReciclaRequest;
import com.reciapp.api.dto.ReciclaResponse;
import com.reciapp.api.entity.Producto;
import com.reciapp.api.entity.ProductoId;
import com.reciapp.api.entity.Recicla;
import com.reciapp.api.entity.Usuario;
import com.reciapp.api.repository.ProductoRepository;
import com.reciapp.api.repository.ReciclaRepository;
import com.reciapp.api.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class ReciclaService {

    private final ReciclaRepository repo;
    private final ProductoRepository productoRepo;
    private final UsuarioRepository usuarioRepo;

    public ReciclaService(ReciclaRepository repo, ProductoRepository productoRepo, UsuarioRepository usuarioRepo) {
        this.repo = repo;
        this.productoRepo = productoRepo;
        this.usuarioRepo = usuarioRepo;
    }

    public List<HistorialDto> getHistorial(Integer idUsuario) {
        return repo.findByIdUsuarioOrderByFechaDescHoraDesc(idUsuario).stream()
            .map(HistorialDto::from)
            .toList();
    }

    @Transactional
    public ReciclaResponse registrar(ReciclaRequest req) {
        Long barras = Long.parseLong(req.getNumeroBarras());

        // Verificar producto
        Producto producto = productoRepo.findById(new ProductoId(req.getTipo(), barras))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

        // Verificar usuario
        Usuario usuario = usuarioRepo.findById(req.getIdUsuario())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        // Crear registro de reciclaje
        LocalDate fecha = LocalDate.now();
        LocalTime hora = LocalTime.now().withNano(0);

        Recicla recicla = new Recicla();
        recicla.setIdUsuario(req.getIdUsuario());
        recicla.setTipo(req.getTipo());
        recicla.setNumeroBarras(barras);
        recicla.setFecha(fecha);
        recicla.setHora(hora);
        repo.save(recicla);

        // Acumular emisiones
        float emisiones = producto.getEmisionesReducibles() != null ? producto.getEmisionesReducibles() : 0f;
        float nuevasEmisiones = (usuario.getEmisionesReducidas() != null ? usuario.getEmisionesReducidas() : 0f) + emisiones;
        usuario.setEmisionesReducidas(nuevasEmisiones);
        usuarioRepo.save(usuario);

        // Construir respuesta
        HistorialDto historial = new HistorialDto(
            req.getIdUsuario(),
            req.getTipo(),
            req.getNumeroBarras(),
            fecha.toString(),
            hora.toString(),
            producto.getNombre(),
            producto.getMaterial(),
            producto.getEmisionesReducibles()
        );

        return new ReciclaResponse(
            "Reciclaje registrado correctamente",
            historial,
            nuevasEmisiones
        );
    }
}
