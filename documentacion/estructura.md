# Estructura Completa del Proyecto - ReciApp

## Repositorios Git

El proyecto se distribuye en dos repositorios independientes:

| Repositorio | Contenido | URL |
|-------------|-----------|-----|
| **Norien-hue/ReciApp** | API Spring Boot + App Movil + Terminal Python + Herramientas | github.com/Norien-hue/ReciApp |
| **Norien-hue/AplicacionInterfaces** | App Escritorio JavaFX | github.com/Norien-hue/AplicacionInterfaces |

---

## Arbol del Repo Principal (ReciApp)

```mermaid
graph LR
    ROOT["reci_app/"] --> API["api-spring/"]
    ROOT --> APP["app/"]
    ROOT --> COMP["components/"]
    ROOT --> STORE["store/"]
    ROOT --> SERV["services/"]
    ROOT --> TYPES["types/"]
    ROOT --> DATA["data/"]
    ROOT --> TERM["terminal/"]
    ROOT --> TOOLS["tools/"]
    ROOT --> DOCS["docs/"]
    ROOT --> DOCUM["documentacion/"]
    ROOT --> START["start.py"]

    API --> API_CTRL["controller/"]
    API --> API_SVC["service/"]
    API --> API_REPO["repository/"]
    API --> API_ENT["entity/"]
    API --> API_SEC["security/"]
    API --> API_CFG["config/"]
    API --> API_DTO["dto/"]

    APP --> AUTH["(auth)/"]
    APP --> TABS["(tabs)/"]
    APP --> LAYOUT["_layout.tsx"]
    APP --> CONNMOD["connection-modal.tsx"]

    AUTH --> LOGIN["login.tsx"]
    AUTH --> REGISTER["register.tsx"]

    TABS --> PRODS["productos/"]
    TABS --> HIST["historial.tsx"]
    TABS --> PERFIL["perfil.tsx"]

    PRODS --> PRODIDX["index.tsx"]
    PRODS --> PRODDET["[barcode].tsx"]

    COMP --> C1["ProductCard"]
    COMP --> C2["SearchBar"]
    COMP --> C3["StatCard"]
    COMP --> C4["TapModal"]
    COMP --> C5["EmptyState"]
    COMP --> C6["RecycleHistoryItem"]

    STORE --> S1["authStore"]
    STORE --> S2["connectionStore"]
    STORE --> S3["productStore"]
    STORE --> S4["recycleStore"]

    SERV --> SV1["api.ts"]
    SERV --> SV2["api.offline.ts"]
    SERV --> SV3["api.client.ts"]
    SERV --> SV4["database.ts"]

    TERM --> TERM1["reciclaje_terminal.py"]
    TOOLS --> TOOLS1["gestionar_imagenes.py"]

    style ROOT fill:#1e40af,color:#fff
    style API fill:#6db33f,color:#fff
    style APP fill:#7c3aed,color:#fff
    style COMP fill:#16a34a,color:#fff
    style STORE fill:#f59e0b,color:#000
    style SERV fill:#0ea5e9,color:#fff
    style TERM fill:#ffd43b,color:#000
    style TOOLS fill:#e74c3c,color:#fff
    style DOCS fill:#6b7280,color:#fff
    style START fill:#ffd43b,color:#000
```

## Arbol del Repo Escritorio (AplicacionInterfaces)

```
ActualAgain/
+-- app/
|   +-- src/main/java/com/javafx/
|   |   +-- model/
|   |   |   +-- Producto.java
|   |   |   +-- Transaccion.java
|   |   |   +-- Usuario.java
|   |   +-- reciWins/
|   |       +-- controllers/
|   |       |   +-- LoginController.java
|   |       |   +-- MainController.java
|   |       |   +-- SingUpController.java
|   |       |   +-- SettingsController.java
|   |       |   +-- NewProductoController.java
|   |       |   +-- ModProductoController.java
|   |       |   +-- NewUserController.java
|   |       |   +-- ModUserController.java
|   |       |   +-- NewTransaccionController.java
|   |       |   +-- ModTransaccionController.java
|   |       +-- utiles/
|   |       |   +-- ApiClient.java
|   |       |   +-- StorageSharer.java
|   |       +-- start/
|   |           +-- StartWin.java
|   +-- src/main/resources/
|       +-- view/
|       |   +-- loginStart_win.fxml
|       |   +-- singUp_win.fxml
|       |   +-- main_win.fxml
|       |   +-- settings_win.fxml
|       |   +-- changePasswd_win.fxml
|       |   +-- newProducto_win.fxml
|       |   +-- modProducto_win.fxml
|       |   +-- newUser_win.fxml
|       |   +-- modUser_win.fxml
|       |   +-- newTransaccion_win.fxml
|       |   +-- modTransaccion_win.fxml
|       |   +-- escanear_win.fxml
|       +-- configuration.properties
+-- build.gradle
```

## Estructura API Spring Boot

```
api-spring/src/main/java/com/reciapp/api/
+-- controller/
|   +-- UsuarioController.java      (login, register, profile, password, TAP)
|   +-- AdminController.java        (CRUD admin: usuarios, productos, transacciones)
|   +-- HealthController.java       (health check)
+-- service/
|   +-- UsuarioService.java         (logica de autenticacion y perfil)
|   +-- ProductoService.java        (logica de productos)
|   +-- ReciclaService.java         (logica de reciclaje)
|   +-- AdminService.java           (operaciones de administracion)
+-- entity/
|   +-- Usuario.java                (JPA @Entity -> tabla Usuarios)
|   +-- Producto.java               (JPA @Entity -> tabla Productos)
|   +-- ProductoId.java             (@EmbeddedId clave compuesta)
|   +-- Recicla.java                (JPA @Entity -> tabla Recicla)
|   +-- ReciclaId.java              (@EmbeddedId clave compuesta)
+-- repository/
|   +-- UsuarioRepository.java      (extends JpaRepository)
|   +-- ProductoRepository.java     (extends JpaRepository)
|   +-- ReciclaRepository.java      (extends JpaRepository)
+-- security/
|   +-- JwtService.java             (generacion y validacion JWT)
|   +-- JwtAuthFilter.java          (filtro Spring Security)
+-- config/
|   +-- SecurityConfig.java         (CORS, rutas publicas/protegidas/admin)
+-- dto/
    +-- LoginRequest.java
    +-- AuthResponse.java
    +-- UsuarioDto.java
    +-- ProductoDto.java
    +-- HistorialDto.java
```

## Flujo de navegacion - App Movil

```mermaid
flowchart TD
    START(["App se inicia"]) --> RESTORE["restoreSession()<br/>Lee AsyncStorage"]
    RESTORE --> CHECK{"checkConnection()"}
    CHECK -->|Online| HASTOKEN{"Hay token?"}
    CHECK -->|Offline| MODAL["connection-modal.tsx"]

    MODAL -->|Recargar| CHECK
    MODAL -->|Modo offline| HASSESSION{"Sesion en<br/>AsyncStorage?"}
    HASSESSION -->|Si| LOADUSER["Restaurar usuario guardado"]
    HASSESSION -->|No| GUEST["loginAsGuest()"]

    LOADUSER --> TABS
    GUEST --> TABS

    HASTOKEN -->|Si| TABS["(tabs)"]
    HASTOKEN -->|No| AUTH["(auth)/login"]

    AUTH -->|Login exitoso| CACHE["Guardar en AsyncStorage"]
    AUTH -->|Ir a registro| REG["(auth)/register"]
    REG -->|Registro exitoso| CACHE
    CACHE --> TABS

    TABS --> PRODS["productos/<br/>Lista + busqueda"]
    TABS --> HIST["historial<br/>Reciclaje + CO2"]
    TABS --> PERFIL["perfil<br/>Stats + TAP"]

    PRODS -->|Tap producto| DET["productos/[barcode]<br/>Detalle"]
    PERFIL -->|Cerrar sesion| AUTH

    style MODAL fill:#dc2626,color:#fff
    style GUEST fill:#f59e0b,color:#000
    style TABS fill:#16a34a,color:#fff
    style AUTH fill:#7c3aed,color:#fff
```

## Archivos clave

### API
- `SecurityConfig.java` — Rutas publicas, autenticadas y admin; CORS; JWT filter
- `JwtAuthFilter.java` — Intercepta peticiones, valida Bearer token, establece SecurityContext
- `AdminService.java` — CRUD de usuarios/productos/transacciones, actualizacion de emisiones

### App Movil
- `services/api.client.ts` — Cliente HTTP real contra Spring Boot (JWT, endpoints)
- `services/api.offline.ts` — Modo offline con AsyncStorage + datos mock
- `services/database.ts` — Wrapper sobre RealApiService con respuestas `{ success, data, error }`
- `store/authStore.ts` — Login, registro, logout, restauracion de sesion
- `app/_layout.tsx` — Auth guard + comprobacion de conexion + PaperProvider

### App Escritorio
- `ApiClient.java` — Singleton, HttpClient Java 11+, JWT, todos los endpoints
- `StorageSharer.java` — Datos compartidos entre ventanas
- `MainController.java` — Dashboard principal (pestanas info personal, admin CRUD)
- `StartWin.java` — Lanzador de ventanas FXML

### Terminal Python
- `reciclaje_terminal.py` — Clase ReciAppTerminal con login, buscar producto/usuario, registrar reciclaje
- `start.py` — Orquestador: arranca API (WSL/EC2) + Expo Metro
- `gestionar_imagenes.py` — Subida/eliminacion de imagenes Base64 en MySQL
