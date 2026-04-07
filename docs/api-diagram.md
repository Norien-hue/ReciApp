# Diagrama de la API ReciApp

## Arquitectura General

```mermaid
graph TB
    subgraph EMU["Android Emulator"]
        APP["Expo App<br/>(React Native)"]
    end

    subgraph WIN["Windows Host"]
        METRO["Metro Bundler<br/>:8082"]
    end

    subgraph WSL["WSL2 Linux"]
        subgraph API["Spring Boot API :3000"]
            direction TB
            SEC["Security Filter Chain<br/>(JWT + CORS + Stateless)"]

            subgraph PUB["Endpoints Publicos"]
                H["GET /api/health"]
                REG["POST /api/usuarios/register"]
                LOG["POST /api/usuarios/login"]
            end

            subgraph PROT["Endpoints Protegidos (JWT)"]
                subgraph USR["Usuarios"]
                    GP["GET /api/usuarios/profile/:id"]
                    UN["PUT /api/usuarios/:id/nombre"]
                    UP["PUT /api/usuarios/:id/password"]
                    UD["DELETE /api/usuarios/:id"]
                end
                subgraph PROD["Productos"]
                    PA["GET /api/productos"]
                    PS["GET /api/productos/search?q="]
                    PO["GET /api/productos/:tipo/:barras"]
                end
                subgraph HIST["Historial"]
                    HI["GET /api/historial/:idUsuario"]
                end
            end
        end

        subgraph DB["MySQL 5.7 (Docker LAMP) :3306"]
            direction TB
            T1["Usuarios<br/>Id_Usuario PK<br/>Nombre UNIQUE<br/>Hash_Contrasena<br/>Permisos<br/>Emisiones_Reducidas<br/>TAP"]
            T2["Productos<br/>(Tipo + Numero_barras) PK<br/>Nombre<br/>Emisiones_Reducibles<br/>Material<br/>Imagen LONGTEXT"]
            T3["Recicla<br/>(Id_Usuario + Tipo +<br/>Numero_barras + Fecha + Hora) PK<br/>FK -> Usuarios<br/>FK -> Productos"]
        end
    end

    APP -->|"HTTP via WSL_IP:3000"| SEC
    APP ---|"JS Bundle"| METRO
    SEC --> PUB
    SEC -->|"Bearer Token"| PROT

    REG & LOG --> T1
    GP & UN & UP & UD --> T1
    PA & PS & PO --> T2
    PA -->|"LEFT JOIN conteo"| T3
    HI --> T3
    HI -->|"JOIN producto"| T2
    T3 -.->|"FK"| T1
    T3 -.->|"FK"| T2

    style PUB fill:#d4edda,stroke:#28a745
    style PROT fill:#fff3cd,stroke:#ffc107
    style DB fill:#d1ecf1,stroke:#17a2b8
    style SEC fill:#f8d7da,stroke:#dc3545
```

## Flujo de Autenticacion

```mermaid
sequenceDiagram
    participant E as Emulator
    participant S as Spring Security
    participant C as Controller
    participant SV as Service
    participant DB as MySQL

    Note over E,DB: Registro de usuario
    E->>S: POST /api/usuarios/register<br/>{nombre, password}
    S->>S: permitAll() - sin JWT
    S->>C: UsuarioController.register()
    C->>SV: UsuarioService.register()
    SV->>DB: existsByNombre(nombre)
    DB-->>SV: false
    SV->>SV: BCrypt.encode(password)
    SV->>DB: save(Usuario)
    DB-->>SV: Usuario con Id
    SV->>SV: JwtService.generateToken(id, nombre, permisos)
    SV-->>E: 201 {token, user}

    Note over E,DB: Login
    E->>S: POST /api/usuarios/login<br/>{nombre, password}
    S->>C: UsuarioController.login()
    C->>SV: UsuarioService.login()
    SV->>DB: findByNombre(nombre)
    DB-->>SV: Usuario
    SV->>SV: BCrypt.matches(password, hash)
    SV->>SV: JwtService.generateToken()
    SV-->>E: 200 {token, user}

    Note over E,DB: Peticion protegida (ej: listar productos)
    E->>S: GET /api/productos<br/>Authorization: Bearer JWT
    S->>S: JwtAuthFilter: validar token
    S->>S: Extraer userId, permisos
    S->>S: SecurityContext.setAuthentication()
    S->>C: ProductoController.getAll()
    C->>SV: ProductoService.getAll(userId)
    SV->>DB: findAll() FROM Productos
    SV->>DB: count() FROM Recicla<br/>WHERE userId AND tipo AND barras
    DB-->>SV: productos + conteo
    SV-->>E: 200 [ProductoDto...]
```

## Modelo de Datos

```mermaid
erDiagram
    Usuarios {
        INT Id_Usuario PK "AUTO_INCREMENT"
        VARCHAR50 Nombre UK "NOT NULL"
        VARCHAR100 Hash_Contrasena "NOT NULL, BCrypt"
        VARCHAR15 Permisos "cliente | administrador"
        FLOAT Emisiones_Reducidas "Default 0"
        INT TAP "Nullable"
    }

    Productos {
        VARCHAR10 Tipo PK "EAN13, UPC, etc."
        BIGINT Numero_barras PK
        VARCHAR50 Nombre
        FLOAT Emisiones_Reducibles "kg CO2"
        VARCHAR15 Material "PET, Vidrio, Aluminio..."
        LONGTEXT Imagen "Base64"
    }

    Recicla {
        INT Id_Usuario PK_FK
        VARCHAR10 Tipo PK_FK
        BIGINT Numero_barras PK_FK
        DATE Fecha PK
        TIME Hora PK
    }

    Usuarios ||--o{ Recicla : "recicla"
    Productos ||--o{ Recicla : "es reciclado"
```
