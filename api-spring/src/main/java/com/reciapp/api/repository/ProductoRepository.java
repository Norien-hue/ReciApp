package com.reciapp.api.repository;

import com.reciapp.api.entity.Producto;
import com.reciapp.api.entity.ProductoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, ProductoId> {

    @Query("SELECT p FROM Producto p WHERE LOWER(p.nombre) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR CAST(p.numeroBarras AS string) LIKE CONCAT('%', :q, '%')")
    List<Producto> search(@Param("q") String query);

    Optional<Producto> findFirstByNumeroBarras(Long numeroBarras);
}
