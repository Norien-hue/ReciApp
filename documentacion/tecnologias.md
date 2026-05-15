# Stack Tecnologico - ReciApp

```mermaid
graph TB
    subgraph "Frontend - App Movil"
        EXPO["Expo 54<br/>Framework"]
        RN["React Native 0.81<br/>UI Runtime"]
        ROUTER["Expo Router 6<br/>Navegacion file-based"]
        NW["NativeWind + Tailwind<br/>Estilos"]
        ZS["Zustand 4.5<br/>Estado global"]
        AS["AsyncStorage<br/>Persistencia local"]
        TS["TypeScript<br/>Tipado estatico"]
    end

    subgraph "Frontend - App Escritorio"
        JFX["JavaFX 25<br/>Framework UI"]
        FXML["FXML<br/>Vistas declarativas"]
        GSON["Gson 2.11<br/>JSON"]
        CTRLFX["ControlsFX 11.2<br/>Controles avanzados"]
    end

    subgraph "CLI - Terminal Python"
        PY["Python 3.10+"]
        REQ["requests<br/>HTTP Client"]
        ANSI["ANSI Colors<br/>Interfaz terminal"]
    end

    subgraph "Capa de Servicios"
        API_IFACE["ApiService<br/>Interfaz abstracta"]
        API_REAL["api.client.ts<br/>Cliente API real"]
        API_OFFLINE["api.offline.ts<br/>Modo offline"]
    end

    subgraph "Backend - Spring Boot 3.4.4"
        SPRING["Spring Boot<br/>Java 21"]
        SEC["Spring Security<br/>JWT + BCrypt"]
        JPA["Spring Data JPA<br/>Hibernate ORM"]
        JJWT["JJWT 0.12.6<br/>Tokens JWT"]
    end

    subgraph "Infraestructura"
        EC2["AWS EC2<br/>Ubuntu 22.04"]
        MYSQL["MySQL 8.x<br/>InnoDB"]
    end

    EXPO --> RN
    RN --> ROUTER
    RN --> NW
    ROUTER --> ZS
    ZS --> AS
    ZS --> API_IFACE
    API_IFACE --> API_REAL
    API_IFACE --> API_OFFLINE

    JFX --> FXML
    JFX --> GSON
    JFX --> CTRLFX

    PY --> REQ

    API_REAL --> SPRING
    GSON --> SPRING
    REQ --> SPRING
    SPRING --> SEC
    SPRING --> JPA
    SEC --> JJWT
    JPA --> MYSQL
    SPRING --> EC2
    MYSQL --> EC2

    style EXPO fill:#1e40af,color:#fff
    style RN fill:#0ea5e9,color:#fff
    style ROUTER fill:#7c3aed,color:#fff
    style NW fill:#06b6d4,color:#fff
    style ZS fill:#f59e0b,color:#000
    style AS fill:#84cc16,color:#000
    style TS fill:#3178c6,color:#fff
    style JFX fill:#3b82f6,color:#fff
    style FXML fill:#60a5fa,color:#fff
    style GSON fill:#93c5fd,color:#000
    style PY fill:#ffd43b,color:#000
    style REQ fill:#3776ab,color:#fff
    style SPRING fill:#6db33f,color:#fff
    style SEC fill:#dc2626,color:#fff
    style JPA fill:#16a34a,color:#fff
    style EC2 fill:#ff9900,color:#fff
    style MYSQL fill:#00758f,color:#fff
    style API_REAL fill:#16a34a,color:#fff
    style API_OFFLINE fill:#9ca3af,color:#fff
```

## Dependencias principales

### Backend (Spring Boot)
| Tecnologia | Version | Uso |
|-----------|---------|-----|
| Java | 21 (LTS) | Lenguaje del backend |
| Spring Boot | 3.4.4 | Framework web |
| Spring Security | 6.x | Autenticacion JWT + BCrypt |
| Spring Data JPA | 3.x | ORM y acceso a BD |
| JJWT | 0.12.6 | Generacion/validacion JWT |
| Lombok | 1.18.x | Reduccion de boilerplate |
| MySQL Connector | 8.x | Driver JDBC |
| Gradle | 8.12 | Build tool |

### App Movil (React Native)
| Tecnologia | Version | Uso |
|-----------|---------|-----|
| React Native | 0.81.5 | Renderizado nativo |
| Expo SDK | 54 | Plataforma de desarrollo |
| Expo Router | 6.0.10 | Navegacion file-based |
| TypeScript | 5.x | Tipado estatico |
| NativeWind | latest | TailwindCSS para RN |
| Zustand | 4.5.1 | Estado global |
| AsyncStorage | 2.2.0 | Cache local |
| Reanimated | 4.1.1 | Animaciones nativas |

### App Escritorio (JavaFX)
| Tecnologia | Version | Uso |
|-----------|---------|-----|
| Java | 24 | Lenguaje de la app |
| JavaFX | 25 | Framework UI |
| Gson | 2.11.0 | JSON |
| ControlsFX | 11.2.2 | Controles avanzados |
| BCrypt (favre) | 0.10.2 | Hashing |

### Terminal Python
| Tecnologia | Version | Uso |
|-----------|---------|-----|
| Python | 3.10+ | Lenguaje de scripting |
| requests | 2.x | Cliente HTTP |
| mysql-connector | 8.x | Acceso directo MySQL (imagenes) |
| reportlab | latest | Generacion PDF documentacion |

### Distribucion e Instaladores
| Tecnologia | Version | Uso |
|-----------|---------|-----|
| jpackage (JDK 24) | -- | Genera app-image y delega en WiX para crear instaladores .exe/.msi |
| WiX Toolset | 3.14 | Compila los instaladores Windows (.exe con wizard grafico y .msi) |
| badass-runtime-plugin | 1.13.1 | Plugin Gradle que orquesta jlink + jpackage |
| Expo Prebuild + Gradle | 8.14 | Compila APK Android desde proyecto Expo |
| Android NDK | 27.1 | Compilacion nativa C++ para React Native |
| CMake | 3.22.1 | Build system para modulos nativos Android |

### Infraestructura
| Tecnologia | Version | Uso |
|-----------|---------|-----|
| AWS EC2 | t2.micro | Servidor cloud |
| Ubuntu | 22.04 LTS | Sistema operativo |
| MySQL | 8.x | Base de datos |
| Git + GitHub | -- | Control de versiones (2 repos) |
