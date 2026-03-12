# Estructura de la App - ReciApp

## Arbol de carpetas

```mermaid
graph LR
    ROOT["reci_app/"] --> APP["app/"]
    ROOT --> COMP["components/"]
    ROOT --> STORE["store/"]
    ROOT --> SERV["services/"]
    ROOT --> TYPES["types/"]
    ROOT --> DATA["data/"]
    ROOT --> DOCS["docs/"]

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

    SERV --> SV1["api.ts - interfaz"]
    SERV --> SV2["api.offline.ts"]
    SERV --> SV3["api.client.ts"]

    style ROOT fill:#1e40af,color:#fff
    style APP fill:#7c3aed,color:#fff
    style COMP fill:#16a34a,color:#fff
    style STORE fill:#f59e0b,color:#000
    style SERV fill:#0ea5e9,color:#fff
    style TYPES fill:#3178c6,color:#fff
    style DATA fill:#84cc16,color:#000
    style DOCS fill:#6b7280,color:#fff
```

## Flujo de navegacion

```mermaid
flowchart TD
    START(["App se inicia"]) --> RESTORE["restoreSession()<br/>Lee AsyncStorage"]
    RESTORE --> CHECK{"checkConnection()"}
    CHECK -->|Online| HASCHECK["setHasChecked()"]
    HASCHECK --> HASTOKEN{"Hay token?"}
    CHECK -->|Offline| MODAL["connection-modal.tsx"]

    MODAL -->|Recargar| CHECK
    MODAL -->|Modo offline| HASSESSION{"Sesion en<br/>AsyncStorage?"}
    HASSESSION -->|Si| LOADUSER["Restaurar usuario<br/>guardado"]
    HASSESSION -->|No| GUEST["loginAsGuest()<br/>Usuario: Invitado"]

    LOADUSER --> TABS
    GUEST --> TABS

    HASTOKEN -->|Si| TABS["(tabs)"]
    HASTOKEN -->|No| AUTH["(auth)/login"]

    AUTH -->|Login exitoso| CACHE["Guardar en AsyncStorage:<br/>token, user, productos, historial"]
    AUTH -->|Ir a registro| REG["(auth)/register"]
    REG -->|Registro exitoso| CACHE
    CACHE --> TABS

    TABS --> PRODS["productos/<br/>Lista + busqueda"]
    TABS --> HIST["historial<br/>Registro reciclaje + CO2"]
    TABS --> PERFIL["perfil<br/>Stats + TAP + config"]

    PRODS -->|Tap producto| DET["productos/[barcode]<br/>Detalle"]
    PERFIL -->|Guest: Iniciar sesion| CHECKAPI{"checkConnection()"}
    CHECKAPI -->|Online| LOGOUT_LOGIN["logout() -> login"]
    CHECKAPI -->|Offline| MODAL
    PERFIL -->|Cerrar sesion| LOGOUT["logout()<br/>Borrar todo AsyncStorage"]
    LOGOUT --> AUTH

    style START fill:#1e40af,color:#fff
    style MODAL fill:#dc2626,color:#fff
    style GUEST fill:#f59e0b,color:#000
    style TABS fill:#16a34a,color:#fff
    style AUTH fill:#7c3aed,color:#fff
    style CACHE fill:#84cc16,color:#000
```

## Archivos clave

### `app/_layout.tsx`
- Auth guard: redirige segun token
- Comprueba conexion al montar
- Muestra connection-modal si offline

### `store/authStore.ts`
- `login()` / `register()`: autenticacion + pre-cacheo de productos/historial
- `loginAsGuest()`: sesion temporal sin persistir
- `restoreSession()`: lee AsyncStorage, retorna boolean
- `logout()`: borra TODAS las claves con `multiRemove()`

### `services/api.ts`
- Interfaz `ApiService` con todos los metodos
- `OfflineApiService`: datos mock con delays simulados
- `RealApiService`: stub listo para backend Express + MySQL

### `store/connectionStore.ts`
- `isOnline`: estado de conexion
- `hasChecked`: evita re-chequeo tras el modal

### `components/TapModal.tsx`
- Modal para consultar TAP
- 3 estados: guest (no disponible), sin TAP guardado, TAP visible
