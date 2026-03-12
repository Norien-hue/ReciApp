# Stack Tecnologico - ReciApp

```mermaid
graph TB
    subgraph "Frontend - App Movil"
        EXPO["Expo 54<br/>Framework"]
        RN["React Native 0.81<br/>UI Runtime"]
        ROUTER["Expo Router 6<br/>Navegacion file-based"]
        NW["NativeWind + Tailwind 3.4<br/>Estilos"]
        ZS["Zustand 4.5<br/>Estado global"]
        AS["AsyncStorage<br/>Persistencia local"]
        TS["TypeScript 5.9<br/>Tipado estatico"]
    end

    subgraph "Capa de Servicios"
        API_IFACE["ApiService<br/>Interfaz"]
        API_OFFLINE["OfflineApiService<br/>Datos mock"]
        API_REAL["RealApiService<br/>fetch HTTP - pendiente"]
    end

    subgraph "Backend - Pendiente"
        SERVER["Servidor API REST<br/>Node.js + Express"]
        MYSQL["MySQL 8<br/>localhost:3306"]
    end

    EXPO --> RN
    RN --> ROUTER
    RN --> NW
    ROUTER --> ZS
    ZS --> AS
    ZS --> API_IFACE
    API_IFACE --> API_OFFLINE
    API_IFACE -.-> API_REAL
    API_REAL -.-> SERVER
    SERVER -.-> MYSQL

    style EXPO fill:#1e40af,color:#fff
    style RN fill:#0ea5e9,color:#fff
    style ROUTER fill:#7c3aed,color:#fff
    style NW fill:#06b6d4,color:#fff
    style ZS fill:#f59e0b,color:#000
    style AS fill:#84cc16,color:#000
    style TS fill:#3178c6,color:#fff
    style API_IFACE fill:#16a34a,color:#fff
    style API_OFFLINE fill:#16a34a,color:#fff
    style API_REAL fill:#9ca3af,color:#fff
    style SERVER fill:#9ca3af,color:#fff
    style MYSQL fill:#9ca3af,color:#fff
```

## Dependencias principales

| Categoria | Tecnologia | Version | Uso |
|-----------|-----------|---------|-----|
| Framework | Expo | 54.0.0 | Plataforma de desarrollo |
| UI | React Native | 0.81.5 | Renderizado nativo |
| Navegacion | Expo Router | 6.0.10 | Rutas file-based |
| Estilos | NativeWind + Tailwind | latest + 3.4.0 | Utilidades CSS |
| Estado | Zustand | 4.5.1 | State management |
| Persistencia | AsyncStorage | 2.1.2 | Cache local |
| Iconos | @expo/vector-icons | 14 | Ionicons |
| Lenguaje | TypeScript | 5.9.2 | Tipado estatico |
