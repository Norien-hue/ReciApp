#!/usr/bin/env python3
"""Genera el PDF resumen de la sesion de debugging de ReciApp."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import cm, mm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
import os

OUTPUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sesion-debug-reciapp.pdf")

# Colores
GREEN = HexColor("#28a745")
DARK_GREEN = HexColor("#1e7e34")
BLUE = HexColor("#0066cc")
DARK = HexColor("#212529")
GRAY = HexColor("#6c757d")
LIGHT_BG = HexColor("#f8f9fa")
RED_BG = HexColor("#fff5f5")
GREEN_BG = HexColor("#f0fff4")
BLUE_BG = HexColor("#ebf8ff")
YELLOW_BG = HexColor("#fffbeb")
WHITE = HexColor("#ffffff")
TABLE_HEADER_BG = HexColor("#2d6a4f")
TABLE_ROW_ALT = HexColor("#f1f8f5")


def build_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        "DocTitle", parent=styles["Title"],
        fontSize=26, leading=32, textColor=DARK_GREEN,
        spaceAfter=4, alignment=TA_CENTER, fontName="Helvetica-Bold"
    ))
    styles.add(ParagraphStyle(
        "DocSubtitle", parent=styles["Normal"],
        fontSize=13, leading=18, textColor=GRAY,
        spaceAfter=20, alignment=TA_CENTER, fontName="Helvetica"
    ))
    styles.add(ParagraphStyle(
        "SectionH", parent=styles["Heading1"],
        fontSize=18, leading=24, textColor=DARK_GREEN,
        spaceBefore=24, spaceAfter=10, fontName="Helvetica-Bold",
        borderWidth=0, borderPadding=0
    ))
    styles.add(ParagraphStyle(
        "SubH", parent=styles["Heading2"],
        fontSize=13, leading=18, textColor=HexColor("#495057"),
        spaceBefore=14, spaceAfter=6, fontName="Helvetica-Bold"
    ))
    styles.add(ParagraphStyle(
        "Body", parent=styles["Normal"],
        fontSize=10, leading=15, textColor=DARK,
        spaceAfter=6, fontName="Helvetica", alignment=TA_JUSTIFY
    ))
    styles.add(ParagraphStyle(
        "BulletItem", parent=styles["Normal"],
        fontSize=10, leading=15, textColor=DARK,
        leftIndent=20, spaceAfter=3, fontName="Helvetica",
        bulletIndent=8, bulletFontName="Helvetica"
    ))
    styles.add(ParagraphStyle(
        "CodeBlock", parent=styles["Normal"],
        fontSize=8.5, leading=12, textColor=HexColor("#1a1a2e"),
        fontName="Courier", backColor=LIGHT_BG,
        leftIndent=12, rightIndent=12, spaceBefore=4, spaceAfter=8,
        borderWidth=0.5, borderColor=HexColor("#dee2e6"),
        borderPadding=6, borderRadius=3
    ))
    styles.add(ParagraphStyle(
        "ProblemTitle", parent=styles["Heading3"],
        fontSize=12, leading=16, textColor=HexColor("#c0392b"),
        spaceBefore=12, spaceAfter=4, fontName="Helvetica-Bold"
    ))
    styles.add(ParagraphStyle(
        "LabelSintoma", parent=styles["Normal"],
        fontSize=10, leading=14, textColor=HexColor("#e74c3c"),
        fontName="Helvetica-BoldOblique", leftIndent=16, spaceAfter=2
    ))
    styles.add(ParagraphStyle(
        "LabelCausa", parent=styles["Normal"],
        fontSize=10, leading=14, textColor=HexColor("#e67e22"),
        fontName="Helvetica-BoldOblique", leftIndent=16, spaceAfter=2
    ))
    styles.add(ParagraphStyle(
        "LabelSolucion", parent=styles["Normal"],
        fontSize=10, leading=14, textColor=GREEN,
        fontName="Helvetica-BoldOblique", leftIndent=16, spaceAfter=2
    ))
    styles.add(ParagraphStyle(
        "Detail", parent=styles["Normal"],
        fontSize=9.5, leading=14, textColor=DARK,
        leftIndent=28, spaceAfter=4, fontName="Helvetica"
    ))
    styles.add(ParagraphStyle(
        "Footer", parent=styles["Normal"],
        fontSize=8, leading=10, textColor=GRAY,
        alignment=TA_CENTER, fontName="Helvetica"
    ))
    return styles


def add_footer(canvas_obj, doc):
    canvas_obj.saveState()
    canvas_obj.setFont("Helvetica", 8)
    canvas_obj.setFillColor(GRAY)
    canvas_obj.drawCentredString(
        A4[0] / 2, 1.5 * cm,
        f"ReciApp - Sesion de Debugging - 27/03/2026  |  Pagina {doc.page}"
    )
    # Green line at top
    canvas_obj.setStrokeColor(GREEN)
    canvas_obj.setLineWidth(3)
    canvas_obj.line(2 * cm, A4[1] - 1.2 * cm, A4[0] - 2 * cm, A4[1] - 1.2 * cm)
    canvas_obj.restoreState()


def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH, pagesize=A4,
        leftMargin=2.2 * cm, rightMargin=2.2 * cm,
        topMargin=2 * cm, bottomMargin=2.2 * cm
    )
    s = build_styles()
    story = []

    # === PORTADA ===
    story.append(Spacer(1, 3 * cm))
    story.append(Paragraph("ReciApp", s["DocTitle"]))
    story.append(Paragraph("Resumen de Sesion de Debugging", s["DocSubtitle"]))
    story.append(Spacer(1, 0.5 * cm))
    story.append(HRFlowable(width="60%", thickness=2, color=GREEN, spaceAfter=12, spaceBefore=4))
    story.append(Spacer(1, 0.5 * cm))
    story.append(Paragraph("27 de marzo de 2026", s["DocSubtitle"]))
    story.append(Spacer(1, 2 * cm))

    # Context box
    ctx_data = [
        ["Componente", "Tecnologia"],
        ["Frontend", "Expo 54 + React Native + TypeScript + Zustand"],
        ["Backend", "Spring Boot 3.4.4 (Java 21) en WSL2"],
        ["Base de datos", "MySQL 5.7 en Docker LAMP (WSL)"],
        ["Emulador", "Android Pixel 8 API 35 (Windows)"],
    ]
    ctx_table = Table(ctx_data, colWidths=[4 * cm, 12 * cm])
    ctx_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (0, 1), (0, -1), DARK_GREEN),
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, TABLE_ROW_ALT]),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#dee2e6")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(ctx_table)
    story.append(Spacer(1, 1 * cm))
    story.append(Paragraph(
        "Objetivo: arrancar la stack completa (API + Emulador + BD) "
        "y verificar que la aplicacion funcionaba end-to-end.",
        s["Body"]
    ))
    story.append(PageBreak())

    # === PROBLEMAS ===
    story.append(Paragraph("Problemas Encontrados y Soluciones", s["SectionH"]))
    story.append(HRFlowable(width="100%", thickness=1, color=GREEN, spaceAfter=10))

    problems = [
        {
            "title": "Problema 1: Emulador Android no se abre desde WSL",
            "sintoma": "Al hacer npx expo start -> a desde WSL, el emulador no aparecia.",
            "causa": "WSL no tiene acceso al Android SDK instalado en Windows. "
                     "El emulador es un proceso de Windows que necesita el SDK de Windows.",
            "solucion": "Modificar start.py para que lance la API en WSL (necesita MySQL) "
                        "pero Expo en Windows nativo (necesita Android SDK). Se anadio "
                        "validacion para que el script solo se ejecute desde Windows."
        },
        {
            "title": "Problema 2: MySQL Access Denied (Error 1698)",
            "sintoma": "Access denied for user 'root'@'localhost'",
            "causa": "MySQL en WSL usaba auth_socket como plugin de autenticacion para root, "
                     "que solo permite login via sudo mysql, no acepta contrasena.",
            "solucion": "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password "
                        "BY 'clase1234'; FLUSH PRIVILEGES;"
        },
        {
            "title": "Problema 3: Base de datos no existia (Error 1049)",
            "sintoma": "Unknown database 'reciInventario_db'",
            "causa": "La BD no estaba creada. El contenedor Docker LAMP no estaba arrancado "
                     "y el MySQL nativo de WSL no tenia la BD.",
            "solucion": "Crear script sql/000_create_database.sql con la estructura completa "
                        "(tablas Usuarios, Productos, Recicla) y datos de ejemplo."
        },
        {
            "title": "Problema 4: Emulador no conecta a la API (AbortError timeout)",
            "sintoma": "[API] Connection check failed: [AbortError: Aborted] al conectar a "
                       "http://10.0.2.2:3000/api/health",
            "causa": "La API corre en WSL2 (red virtual propia). 10.0.2.2 del emulador "
                     "apunta al localhost de Windows, no a WSL. El port forwarding de WSL2 "
                     "no funciona de forma fiable para IPv4.",
            "solucion": "Obtener la IP real de WSL (wsl -e hostname -I) y usarla directamente "
                        "en api.client.ts. Se actualizo start.py para detectar la IP "
                        "automaticamente al arrancar y escribirla en el codigo."
        },
        {
            "title": "Problema 5: Spring Security devuelve 403 en rutas publicas",
            "sintoma": "HTTP 403 en POST /api/usuarios/login y /register, que estaban "
                       "configuradas como permitAll().",
            "causa": "La API arranco sin conexion a MySQL, dejando JPA/Hibernate en estado "
                     "roto. Spring Security funcionaba pero los controladores fallaban.",
            "solucion": "Reiniciar la API tras arreglar la conexion a MySQL. Al arrancar "
                        "con la BD disponible, JPA inicializa correctamente."
        },
        {
            "title": "Problema 6: Case sensitivity en nombres de tabla (Error 1146)",
            "sintoma": "Table 'reciInventario_db.usuarios' doesn't exist (busca en minusculas "
                       "pero la tabla se llama Usuarios con mayuscula).",
            "causa": "Spring Boot usa SpringPhysicalNamingStrategy por defecto, que convierte "
                     "todos los nombres a snake_case minusculas. En Linux, MySQL es "
                     "case-sensitive con nombres de tabla.",
            "solucion": "Cambiar naming strategy en application.properties a "
                        "PhysicalNamingStrategyStandardImpl para que Hibernate use los "
                        "nombres exactos de @Table(name=\"Usuarios\")."
        },
    ]

    for p in problems:
        block = []
        block.append(Paragraph(p["title"], s["ProblemTitle"]))
        block.append(Paragraph("Sintoma:", s["LabelSintoma"]))
        block.append(Paragraph(p["sintoma"], s["Detail"]))
        block.append(Paragraph("Causa:", s["LabelCausa"]))
        block.append(Paragraph(p["causa"], s["Detail"]))
        block.append(Paragraph("Solucion:", s["LabelSolucion"]))
        block.append(Paragraph(p["solucion"], s["Detail"]))
        block.append(Spacer(1, 6))
        story.append(KeepTogether(block))

    story.append(PageBreak())

    # === ARCHIVOS MODIFICADOS ===
    story.append(Paragraph("Archivos Modificados", s["SectionH"]))
    story.append(HRFlowable(width="100%", thickness=1, color=GREEN, spaceAfter=10))

    file_data = [
        ["Archivo", "Cambio Realizado"],
        ["start.py",
         "Reescrito: API en WSL + Expo en Windows, deteccion automatica de IP WSL, flag --express"],
        ["services/api.client.ts",
         "Usar IP de WSL directamente para Android en vez de 10.0.2.2 o localhost"],
        ["application.properties",
         "Anadido server.address=0.0.0.0 y PhysicalNamingStrategyStandardImpl"],
        ["sql/000_create_database.sql",
         "NUEVO: Script creacion de BD con tablas Usuarios, Productos, Recicla y datos ejemplo"],
    ]
    file_table = Table(file_data, colWidths=[5.5 * cm, 10.5 * cm])
    file_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 1), (0, -1), "Courier"),
        ("FONTSIZE", (0, 1), (0, -1), 8),
        ("TEXTCOLOR", (0, 1), (0, -1), BLUE),
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, TABLE_ROW_ALT]),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#dee2e6")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(file_table)
    story.append(Spacer(1, 1 * cm))

    # === ARQUITECTURA ===
    story.append(Paragraph("Arquitectura Final de Despliegue", s["SectionH"]))
    story.append(HRFlowable(width="100%", thickness=1, color=GREEN, spaceAfter=10))

    arch_data = [
        ["Capa", "Componente", "Detalles"],
        ["Windows Host", "Expo Metro Bundler", "Puerto :8082, sirve JS bundle"],
        ["Windows Host", "Android Emulator (Pixel 8)", "Conecta a WSL_IP:3000"],
        ["WSL2 Linux\n(172.31.168.208)", "Spring Boot API",
         "Puerto :3000, 0.0.0.0\nJWT HS256 (7 dias)\nBCrypt passwords\nHikariCP pool"],
        ["WSL2 Linux", "Docker LAMP Container",
         "MySQL 5.7, puerto :3306\nBD: reciInventario_db"],
    ]
    arch_table = Table(arch_data, colWidths=[4 * cm, 4.5 * cm, 7.5 * cm])
    arch_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (0, 1), (0, -1), DARK_GREEN),
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, TABLE_ROW_ALT]),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#dee2e6")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 1 * cm))

    # === COMANDOS ===
    story.append(Paragraph("Comandos Clave para el Futuro", s["SectionH"]))
    story.append(HRFlowable(width="100%", thickness=1, color=GREEN, spaceAfter=10))

    commands = [
        ("Arrancar todo (Windows CMD):", "python start.py"),
        ("Con Express (mas rapido):", "python start.py --express"),
        ("Crear BD (solo 1a vez):", 'wsl -e bash -c "sudo mysql &lt; sql/000_create_database.sql"'),
        ("Verificar API:", "curl http://localhost:3000/api/health"),
        ("Registrar usuario:", 'curl -X POST http://localhost:3000/api/usuarios/register '
                               '-H "Content-Type: application/json" '
                               '-d \'{"nombre":"test","password":"test1234"}\''),
    ]

    for desc, cmd in commands:
        story.append(Paragraph(desc, s["SubH"]))
        story.append(Paragraph(cmd.replace(" ", "&nbsp;"), s["CodeBlock"]))

    # === ENDPOINTS ===
    story.append(PageBreak())
    story.append(Paragraph("Endpoints de la API", s["SectionH"]))
    story.append(HRFlowable(width="100%", thickness=1, color=GREEN, spaceAfter=10))

    ep_data = [
        ["Metodo", "Endpoint", "Auth", "Descripcion"],
        ["GET", "/api/health", "No", "Health check"],
        ["POST", "/api/usuarios/register", "No", "Crear cuenta"],
        ["POST", "/api/usuarios/login", "No", "Iniciar sesion"],
        ["GET", "/api/usuarios/profile/:id", "JWT", "Obtener perfil"],
        ["PUT", "/api/usuarios/:id/nombre", "JWT", "Cambiar nombre"],
        ["PUT", "/api/usuarios/:id/password", "JWT", "Cambiar contrasena"],
        ["DELETE", "/api/usuarios/:id", "JWT", "Eliminar cuenta"],
        ["GET", "/api/productos", "JWT", "Listar productos"],
        ["GET", "/api/productos/search?q=", "JWT", "Buscar productos"],
        ["GET", "/api/productos/:tipo/:barras", "JWT", "Detalle producto"],
        ["GET", "/api/historial/:idUsuario", "JWT", "Historial reciclaje"],
    ]
    ep_table = Table(ep_data, colWidths=[2 * cm, 5.5 * cm, 1.5 * cm, 7 * cm])
    ep_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 1), (1, -1), "Courier"),
        ("FONTSIZE", (1, 1), (1, -1), 8),
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, TABLE_ROW_ALT]),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#dee2e6")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(ep_table)
    story.append(Spacer(1, 1 * cm))

    # === SCHEMA ===
    story.append(Paragraph("Esquema de Base de Datos", s["SectionH"]))
    story.append(HRFlowable(width="100%", thickness=1, color=GREEN, spaceAfter=10))

    story.append(Paragraph("Tabla: Usuarios", s["SubH"]))
    u_data = [
        ["Columna", "Tipo", "Notas"],
        ["Id_Usuario", "INT", "PK, AUTO_INCREMENT"],
        ["Nombre", "VARCHAR(50)", "UNIQUE, NOT NULL"],
        ["Hash_Contrasena", "VARCHAR(100)", "NOT NULL, BCrypt"],
        ["Permisos", "VARCHAR(15)", "cliente | administrador"],
        ["Emisiones_Reducidas", "FLOAT", "Default 0"],
        ["TAP", "INT", "Nullable"],
    ]
    u_table = Table(u_data, colWidths=[4.5 * cm, 4 * cm, 7.5 * cm])
    u_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 1), (0, -1), "Courier"),
        ("FONTSIZE", (0, 1), (0, -1), 8.5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, TABLE_ROW_ALT]),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#dee2e6")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(u_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Tabla: Productos", s["SubH"]))
    p_data = [
        ["Columna", "Tipo", "Notas"],
        ["Tipo", "VARCHAR(10)", "PK (parte 1)"],
        ["Numero_barras", "BIGINT", "PK (parte 2)"],
        ["Nombre", "VARCHAR(50)", "Nombre del producto"],
        ["Emisiones_Reducibles", "FLOAT", "kg CO2 por reciclaje"],
        ["Material", "VARCHAR(15)", "PET, Vidrio, Aluminio, Brick..."],
        ["Imagen", "LONGTEXT", "Base64 encoded"],
    ]
    p_table = Table(p_data, colWidths=[4.5 * cm, 4 * cm, 7.5 * cm])
    p_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 1), (0, -1), "Courier"),
        ("FONTSIZE", (0, 1), (0, -1), 8.5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, TABLE_ROW_ALT]),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#dee2e6")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(p_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Tabla: Recicla", s["SubH"]))
    r_data = [
        ["Columna", "Tipo", "Notas"],
        ["Id_Usuario", "INT", "PK + FK -> Usuarios (CASCADE)"],
        ["Tipo", "VARCHAR(10)", "PK + FK -> Productos"],
        ["Numero_barras", "BIGINT", "PK + FK -> Productos"],
        ["Fecha", "DATE", "PK"],
        ["Hora", "TIME", "PK"],
    ]
    r_table = Table(r_data, colWidths=[4.5 * cm, 4 * cm, 7.5 * cm])
    r_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 1), (0, -1), "Courier"),
        ("FONTSIZE", (0, 1), (0, -1), 8.5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, TABLE_ROW_ALT]),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#dee2e6")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(r_table)

    # Build
    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    print(f"PDF generado: {OUTPUT_PATH}")


if __name__ == "__main__":
    build_pdf()
