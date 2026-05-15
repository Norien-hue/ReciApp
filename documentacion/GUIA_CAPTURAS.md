# Guia para realizar las capturas de pantalla

Este documento explica paso a paso como obtener cada una de las 17 capturas
que deben sustituir a los recuadros rojos del documento
**ReciApp_Documentacion_Proyecto.docx**.

> **Consejo general:** usa la tecla `Win + Shift + S` (Recortes de Windows)
> para capturar solo la zona que necesitas y pegarla directamente en el
> documento de Word / Google Docs.

---

## Captura #1 — Diagrama general de la arquitectura del sistema

**Seccion del documento:** 1. Resumen del Proyecto

**Como hacerla:**

1. Abre **draw.io** (https://app.diagrams.net) o cualquier herramienta de
   diagramas (Lucidchart, Excalidraw, PowerPoint...).
2. Dibuja un diagrama con 5 bloques:
   - **App Movil (React Native)** a la izquierda.
   - **App Escritorio (JavaFX)** debajo.
   - **Terminal Python** debajo.
   - **API REST (Spring Boot)** en el centro, con el texto `HTTP :3000`.
   - **MySQL 8.x** a la derecha, con el texto `JDBC :3306`.
3. Conecta los 3 clientes al bloque de la API con flechas etiquetadas
   `HTTP :3000`, y la API a MySQL con una flecha `JDBC :3306`.
4. Exporta como PNG y pegalo en el documento.

---

## Captura #2 — Flujo de autenticacion JWT

**Seccion del documento:** 3. Arquitectura del Sistema

**Como hacerla:**

1. En draw.io o similar, crea un diagrama de secuencia con 3 columnas:
   **Cliente**, **API (Spring Boot)** y **MySQL**.
2. Dibuja las flechas en este orden:
   - Cliente → API: `POST /api/usuarios/login { nombre, password }`
   - API → MySQL: `SELECT * FROM Usuarios WHERE Nombre = ?`
   - MySQL → API: `Usuario encontrado`
   - API (nota interna): `BCrypt.matches(password, hash)` y `JwtService.generateToken()`
   - API → Cliente: `{ token: "eyJ...", usuario: { id, nombre, permisos } }`
   - Cliente → API: `GET /api/productos` con cabecera `Authorization: Bearer eyJ...`
   - API (nota interna): `JwtAuthFilter valida el token`
   - API → Cliente: `[ { producto1 }, { producto2 }, ... ]`
3. Exporta como PNG.

---

## Captura #3 — Modelo Entidad-Relacion

**Seccion del documento:** 4. Modelo Entidad-Relacion

**Como hacerla:**

1. Abre **MySQL Workbench** y conecta a la base de datos `reciInventario_db`.
2. Ve a **Database > Reverse Engineer...** y sigue el asistente para
   importar el esquema.
3. Se generara automaticamente un diagrama ER con las tres tablas
   (Usuarios, Productos, Recicla) y sus relaciones.
4. Alternativa: si no tienes Workbench, abre https://dbdiagram.io y pega
   este codigo:

```
Table Usuarios {
  Id_Usuario int [pk, increment]
  Nombre varchar(50) [unique, not null]
  Hash_Contrasena varchar(100) [not null]
  Permisos varchar(15) [default: 'cliente']
  Emisiones_Reducidas float [default: 0]
  TAP int [default: null]
}

Table Productos {
  Tipo varchar(10) [pk]
  Numero_barras bigint [pk]
  Nombre varchar(50)
  Emisiones_Reducibles float
  Material varchar(15)
  Imagen longtext
}

Table Recicla {
  Id_Usuario int [pk, ref: > Usuarios.Id_Usuario]
  Tipo varchar(10) [pk]
  Numero_barras bigint [pk]
  Fecha date [pk]
  Hora time [pk]
}

Ref: Recicla.(Tipo, Numero_barras) > Productos.(Tipo, Numero_barras)
```

5. Captura el diagrama resultante.

---

## Captura #4 — Peticion a la API en Postman

**Seccion del documento:** 7. API REST (Spring Boot)

**Como hacerla:**

1. Abre **Postman** (o Insomnia, Thunder Client en VS Code...).
2. Crea una peticion `POST` a `http://52.201.91.206:3000/api/usuarios/login`.
3. En el body (JSON), pon:
   ```json
   {
     "nombre": "tu_usuario",
     "password": "tu_contraseña"
   }
   ```
4. Pulsa **Send**.
5. En la respuesta deberia aparecer el JSON con `token` y `usuario`.
6. Captura la ventana de Postman mostrando la peticion y la respuesta.

---

## Captura #5 — App Movil: Pantalla de Login

**Seccion del documento:** 8. Aplicacion Movil

**Como hacerla:**

1. Arranca la app movil de una de estas formas:
   - **Expo Go (desarrollo):** `npx expo start` y abrela en tu movil con Expo Go o en un emulador.
   - **APK release (emulador):** Instala la APK en el emulador con `adb install ReciApp-release.apk` (ver GUIA_INSTALACION_APK.md).
   - **APK release (movil fisico):** Transfiere la APK al movil e instalala.
2. Si ya tienes sesion, cierra sesion desde Perfil.
3. Deberia mostrarse la pantalla de login con el icono de la hoja verde,
   "ReciApp", campos de usuario y contrasena, y el boton "Iniciar Sesion".
4. Captura la pantalla del movil (en Android: `Vol-` + `Power`; en
   emulador: boton de camara en la barra lateral).

---

## Captura #6 — App Movil: Productos con filtro activo

**Seccion del documento:** 8. Aplicacion Movil

**Como hacerla (sirve Expo Go, APK en emulador o APK en movil fisico):**

1. Inicia sesion en la app movil.
2. Ve a la pestana **Productos** (primera pestana).
3. Pulsa en uno de los filtros de material (por ejemplo "Aluminio" o
   "Vidrio") para que se vea activo.
4. La lista debe mostrar solo los productos de ese material.
5. Captura la pantalla.

---

## Captura #7 — App Movil: Historial con total CO2

**Seccion del documento:** 8. Aplicacion Movil

**Como hacerla:**

1. Con la sesion iniciada, ve a la pestana **Historial**.
2. Asegurate de tener al menos un reciclaje registrado (hazlo desde el
   terminal Python si no tienes ninguno).
3. Debe verse la cabecera verde con "Total reducido en historial: X.X kg
   CO2" y debajo la lista de reciclajes.
4. Captura la pantalla.

---

## Captura #8 — App Movil: Perfil con estadisticas y TAP

**Seccion del documento:** 8. Aplicacion Movil

**Como hacerla:**

1. Ve a la pestana **Perfil**.
2. Si no tienes TAP, pulsa en "Ver TAP" y luego en "Solicitar TAP" dentro
   del modal.
3. Cierra el modal del TAP.
4. La pantalla debe mostrar: nombre del usuario, rol, estadisticas de
   emisiones (kg y toneladas), y los botones de gestion.
5. Captura la pantalla completa del perfil.

---

## Captura #9 — App Movil: Modal de conexion offline

**Seccion del documento:** 8. Aplicacion Movil

**Como hacerla (sirve Expo Go, APK en emulador o APK en movil fisico):**

1. **Opcion A (sin servidor):** Para la API en el servidor EC2 y abre la
   app. Al no poder conectar, aparecera el modal con el icono de nube
   tachada, "Sin conexion", y los botones "Recargar" y "Modo offline".
2. **Opcion B (modo avion):** Pon el movil/emulador en modo avion y abre la app.
3. Captura la pantalla del modal.
4. Recuerda volver a arrancar la API despues.

> **Nota:** En el emulador se puede activar modo avion desde la barra de
> notificaciones o con: `adb shell cmd connectivity airplane-mode enable`

---

## Captura #10 — JavaFX: Pantalla de Login

**Seccion del documento:** 9. Aplicacion de Escritorio

**Como hacerla:**

1. Abre la aplicacion de escritorio (ejecuta el proyecto JavaFX desde tu
   IDE o con `gradle run`).
2. Aparecera la ventana de login con campos de usuario y contrasena.
3. Captura la ventana con `Alt + Print Screen` (captura solo la ventana
   activa).

---

## Captura #11 — JavaFX: Dashboard - Informacion Personal

**Seccion del documento:** 9. Aplicacion de Escritorio

**Como hacerla:**

1. Inicia sesion en la app de escritorio con un usuario cualquiera.
2. Ve a la primera pestana (informacion personal).
3. Debe mostrar nombre, rol y emisiones reducidas.
4. Captura la ventana.

---

## Captura #12 — JavaFX: Dashboard - Admin Usuarios

**Seccion del documento:** 9. Aplicacion de Escritorio

**Como hacerla:**

1. Inicia sesion con un usuario **administrador**.
2. Ve a la pestana de **Administracion**.
3. Selecciona la seccion/tabla de **Usuarios**.
4. Debe verse la tabla con columnas (ID, Nombre, Permisos, Emisiones, TAP)
   y los botones Crear/Modificar/Eliminar.
5. Captura la ventana.

---

## Captura #13 — JavaFX: Dashboard - Admin Productos

**Seccion del documento:** 9. Aplicacion de Escritorio

**Como hacerla:**

1. Sigue en la pestana de Administracion con el usuario administrador.
2. Cambia a la seccion/tabla de **Productos**.
3. Debe verse la tabla con columnas (Tipo, Codigo barras, Nombre,
   Material, Emisiones).
4. Captura la ventana.

---

## Captura #14 — JavaFX: Dialogo Crear/Modificar Producto

**Seccion del documento:** 9. Aplicacion de Escritorio

**Como hacerla:**

1. Desde la pestana de Administracion > Productos, pulsa el boton
   **Crear** o selecciona un producto y pulsa **Modificar**.
2. Se abrira una ventana de dialogo con campos: Tipo, Codigo de barras,
   Nombre, Material, Emisiones Reducibles e Imagen.
3. Rellena algunos campos para que se vea con contenido.
4. Captura la ventana de dialogo (puedes capturar solo el dialogo o con
   el dashboard detras).

---

## Captura #15 — Terminal: Banner y autenticacion

**Seccion del documento:** 10. Terminal de Reciclaje

**Como hacerla:**

1. Abre una terminal (CMD, PowerShell o la terminal de tu IDE).
2. Ejecuta:
   ```
   cd terminal
   python reciclaje_terminal.py
   ```
3. Debe aparecer el banner verde de "RECIAPP - Terminal de Reciclaje",
   el mensaje de conexion con la API y la autenticacion del operador.
4. Captura la terminal justo despues de que diga "Terminal autenticado
   correctamente" y antes de escanear ningun producto.

---

## Captura #16 — Terminal: Flujo completo de reciclaje

**Seccion del documento:** 10. Terminal de Reciclaje

**Como hacerla:**

1. Con el terminal ya autenticado (paso anterior), realiza un reciclaje
   completo:
   - Cuando pida el codigo de barras, escribe: `8410076472885` (Coca-Cola).
   - Cuando pida el TAP, introduce el TAP de un usuario (consultalo desde
     la app movil o la de escritorio).
   - Confirma con `S`.
2. Debe verse todo el flujo: producto encontrado (verde), usuario
   verificado, resumen, confirmacion y el recuadro final de "RECICLAJE
   REGISTRADO" con las emisiones acumuladas.
3. Puede que necesites hacer la terminal mas alta o hacer scroll para
   capturar todo el flujo. Usa `Win + Shift + S` y selecciona toda la zona.

---

## Captura #17 — Consola EC2 con la API en ejecucion

**Seccion del documento:** 11. Despliegue y Dockerizacion

**Como hacerla:**

1. Conecta por SSH a tu instancia EC2:
   ```
   ssh -i tu_clave.pem ubuntu@52.201.91.206
   ```
2. Arranca la API si no esta corriendo:
   ```
   java -jar api-spring.jar &
   ```
3. Comprueba que esta corriendo:
   ```
   curl http://localhost:3000/api/health
   ```
4. Captura la terminal SSH mostrando la salida del JAR en ejecucion y/o
   la respuesta del health check `{"status":"ok"}`.
5. Alternativa: si usas Docker, captura la salida de
   `docker compose up -d` y `docker ps` mostrando los contenedores.

---

## Resumen rapido

| #  | Que capturar                            | Herramienta necesaria       |
|----|------------------------------------------|-----------------------------|
| 1  | Diagrama arquitectura                   | draw.io / Excalidraw        |
| 2  | Diagrama secuencia JWT                  | draw.io / Excalidraw        |
| 3  | Modelo ER                               | MySQL Workbench / dbdiagram |
| 4  | Peticion API                            | Postman / Insomnia          |
| 5  | Movil - Login                           | Expo Go / APK en emulador / APK en movil |
| 6  | Movil - Productos filtrados             | Expo Go / APK en emulador / APK en movil |
| 7  | Movil - Historial                       | Expo Go / APK en emulador / APK en movil |
| 8  | Movil - Perfil                          | Expo Go / APK en emulador / APK en movil |
| 9  | Movil - Modal offline                   | Expo Go / APK en emulador / APK en movil |
| 10 | JavaFX - Login                          | App escritorio              |
| 11 | JavaFX - Info personal                  | App escritorio              |
| 12 | JavaFX - Admin usuarios                 | App escritorio (admin)      |
| 13 | JavaFX - Admin productos                | App escritorio (admin)      |
| 14 | JavaFX - Dialogo producto               | App escritorio (admin)      |
| 15 | Terminal - Banner                       | Python + terminal           |
| 16 | Terminal - Reciclaje completo           | Python + terminal           |
| 17 | EC2 - API corriendo                     | SSH a EC2                   |
