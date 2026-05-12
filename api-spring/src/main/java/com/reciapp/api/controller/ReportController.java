package com.reciapp.api.controller;

import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.util.JRLoader;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.io.InputStream;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
public class ReportController {

    private final DataSource dataSource;

    public ReportController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/{nombre}")
    public ResponseEntity<byte[]> generarInforme(
            @PathVariable String nombre,
            @RequestParam(required = false) Map<String, String> params) {

        // Validar nombre del informe (solo informe1, informe2)
        if (!nombre.equals("informe1") && !nombre.equals("informe2")) {
            return ResponseEntity.badRequest().build();
        }

        String rutaRecurso = "/reports/" + nombre + ".jasper";

        try (InputStream reportStream = getClass().getResourceAsStream(rutaRecurso)) {
            if (reportStream == null) {
                return ResponseEntity.notFound().build();
            }

            JasperReport report = (JasperReport) JRLoader.loadObject(reportStream);

            // Convertir parametros de String a Object para JasperReports
            Map<String, Object> jasperParams = new HashMap<>();
            if (params != null) {
                // Excluir parametros de Spring/request que no son del informe
                for (Map.Entry<String, String> entry : params.entrySet()) {
                    jasperParams.put(entry.getKey(), entry.getValue());
                }
            }

            // Obtener conexion JDBC del DataSource de Spring
            Connection conn = dataSource.getConnection();
            try {
                JasperPrint jasperPrint = JasperFillManager.fillReport(report, jasperParams, conn);

                byte[] pdfBytes = JasperExportManager.exportReportToPdf(jasperPrint);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_PDF);
                headers.setContentDispositionFormData("attachment", nombre + ".pdf");
                headers.setContentLength(pdfBytes.length);

                return ResponseEntity.ok().headers(headers).body(pdfBytes);
            } finally {
                conn.close();
            }

        } catch (JRException e) {
            System.err.println("Error al generar informe " + nombre + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        } catch (Exception e) {
            System.err.println("Error inesperado al generar informe " + nombre + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
