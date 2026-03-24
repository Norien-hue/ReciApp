package com.reciapp.api.service;

import com.reciapp.api.dto.ProductoDto;
import com.reciapp.api.entity.Producto;
import com.reciapp.api.entity.ProductoId;
import com.reciapp.api.repository.ProductoRepository;
import com.reciapp.api.repository.ReciclaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepo;
    private final ReciclaRepository reciclaRepo;

    public ProductoService(ProductoRepository productoRepo, ReciclaRepository reciclaRepo) {
        this.productoRepo = productoRepo;
        this.reciclaRepo = reciclaRepo;
    }

    public List<ProductoDto> getAll(Integer userId) {
        return productoRepo.findAll().stream()
            .map(p -> toDto(p, userId))
            .toList();
    }

    public List<ProductoDto> search(String query, Integer userId) {
        return productoRepo.search(query).stream()
            .map(p -> toDto(p, userId))
            .toList();
    }

    public ProductoDto getOne(String tipo, Long numeroBarras, Integer userId) {
        var producto = productoRepo.findById(new ProductoId(tipo, numeroBarras))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        return toDto(producto, userId);
    }

    private ProductoDto toDto(Producto p, Integer userId) {
        long count = reciclaRepo.countByIdUsuarioAndTipoAndNumeroBarras(
            userId, p.getTipo(), p.getNumeroBarras()
        );
        return ProductoDto.from(p, count);
    }
}
