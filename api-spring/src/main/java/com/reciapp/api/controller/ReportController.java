package com.reciapp.api.controller;

import com.reciapp.api.entity.Producto;
import com.reciapp.api.entity.Recicla;
import com.reciapp.api.entity.Usuario;
import com.reciapp.api.repository.ProductoRepository;
import com.reciapp.api.repository.ReciclaRepository;
import com.reciapp.api.repository.UsuarioRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
public class ReportController {

    private static final Logger log = LoggerFactory.getLogger(ReportController.class);

    private final ProductoRepository productoRepo;
    private final UsuarioRepository usuarioRepo;
    private final ReciclaRepository reciclaRepo;

    private static final DeviceRgb GREEN = new DeviceRgb(22, 163, 74);
    private static final DeviceRgb LIGHT_GREEN = new DeviceRgb(220, 252, 231);

    public ReportController(ProductoRepository productoRepo, UsuarioRepository usuarioRepo,
                           ReciclaRepository reciclaRepo) {
        this.productoRepo = productoRepo;
        this.usuarioRepo = usuarioRepo;
        this.reciclaRepo = reciclaRepo;
    }

    @GetMapping("/{nombre}")
    public ResponseEntity<byte[]> generateReport(@PathVariable String nombre,
                                                  @RequestParam(required = false) String NombreUsuario) {
        log.info("[REPORT] Generando informe: {} | filtro: {}", nombre, NombreUsuario);

        try {
            byte[] pdf;
            String filename;

            switch (nombre) {
                case "informe1":
                    pdf = generarInforme1();
                    filename = "catalogo_productos.pdf";
                    break;
                case "informe2":
                    pdf = generarInforme2(NombreUsuario);
                    filename = "historico_reciclaje.pdf";
                    break;
                default:
                    return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);

        } catch (Exception e) {
            log.error("[REPORT] Error generando informe: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private byte[] generarInforme1() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document doc = new Document(pdfDoc);

        doc.add(new Paragraph("ReciApp - Catalogo de Productos")
                .setFontSize(20).setBold().setFontColor(GREEN)
                .setTextAlignment(TextAlignment.CENTER));

        doc.add(new Paragraph("Generado: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                .setFontSize(10).setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER));

        doc.add(new Paragraph("\n"));

        List<Producto> productos = productoRepo.findAll();

        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 3, 3, 2, 2}))
                .useAllAvailableWidth();

        addHeaderCell(table, "Tipo");
        addHeaderCell(table, "Codigo Barras");
        addHeaderCell(table, "Nombre");
        addHeaderCell(table, "Material");
        addHeaderCell(table, "CO2 (kg)");

        boolean alt = false;
        for (Producto p : productos) {
            addDataCell(table, p.getTipo(), alt);
            addDataCell(table, String.valueOf(p.getNumeroBarras()), alt);
            addDataCell(table, p.getNombre() != null ? p.getNombre() : "", alt);
            addDataCell(table, p.getMaterial() != null ? p.getMaterial() : "", alt);
            addDataCell(table, p.getEmisionesReducibles() != null ?
                    String.format("%.3f", p.getEmisionesReducibles()) : "0", alt);
            alt = !alt;
        }

        doc.add(table);

        doc.add(new Paragraph("\nTotal de productos: " + productos.size())
                .setFontSize(11).setBold());

        doc.close();
        return baos.toByteArray();
    }

    private byte[] generarInforme2(String filtroNombre) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document doc = new Document(pdfDoc);

        doc.add(new Paragraph("ReciApp - Historico de Reciclaje por Usuario")
                .setFontSize(20).setBold().setFontColor(GREEN)
                .setTextAlignment(TextAlignment.CENTER));

        doc.add(new Paragraph("Generado: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                .setFontSize(10).setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER));

        doc.add(new Paragraph("\n"));

        List<Usuario> usuarios;
        if (filtroNombre != null && !filtroNombre.equals("%")) {
            String like = filtroNombre.replace("%", "");
            usuarios = usuarioRepo.findAll().stream()
                    .filter(u -> u.getNombre().toLowerCase().contains(like.toLowerCase()))
                    .toList();
        } else {
            usuarios = usuarioRepo.findAll();
        }

        for (Usuario usuario : usuarios) {
            doc.add(new Paragraph("Usuario: " + usuario.getNombre())
                    .setFontSize(14).setBold().setFontColor(GREEN));
            doc.add(new Paragraph("Rol: " + usuario.getPermisos() +
                    " | Emisiones reducidas: " + String.format("%.3f",
                    usuario.getEmisionesReducidas() != null ? usuario.getEmisionesReducidas() : 0f) + " kg CO2")
                    .setFontSize(10));

            List<Recicla> transacciones = reciclaRepo.findByIdUsuarioOrderByFechaDescHoraDesc(usuario.getId());

            if (transacciones.isEmpty()) {
                doc.add(new Paragraph("  Sin transacciones registradas.")
                        .setFontSize(10).setItalic().setFontColor(ColorConstants.GRAY));
            } else {
                Table table = new Table(UnitValue.createPercentArray(new float[]{2, 3, 2, 2}))
                        .useAllAvailableWidth();

                addHeaderCell(table, "Tipo");
                addHeaderCell(table, "Codigo Barras");
                addHeaderCell(table, "Fecha");
                addHeaderCell(table, "Hora");

                boolean alt = false;
                for (Recicla r : transacciones) {
                    addDataCell(table, r.getTipo(), alt);
                    addDataCell(table, String.valueOf(r.getNumeroBarras()), alt);
                    addDataCell(table, r.getFecha().toString(), alt);
                    addDataCell(table, r.getHora().toString(), alt);
                    alt = !alt;
                }

                doc.add(table);
                doc.add(new Paragraph("Total transacciones: " + transacciones.size())
                        .setFontSize(9).setItalic());
            }

            doc.add(new Paragraph("\n"));
        }

        doc.close();
        return baos.toByteArray();
    }

    private void addHeaderCell(Table table, String text) {
        table.addHeaderCell(new Cell()
                .add(new Paragraph(text).setBold().setFontSize(10).setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(GREEN)
                .setTextAlignment(TextAlignment.CENTER));
    }

    private void addDataCell(Table table, String text, boolean alternate) {
        Cell cell = new Cell()
                .add(new Paragraph(text).setFontSize(9))
                .setTextAlignment(TextAlignment.CENTER);
        if (alternate) {
            cell.setBackgroundColor(LIGHT_GREEN);
        }
        table.addCell(cell);
    }
}
