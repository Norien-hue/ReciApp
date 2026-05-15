# ReciApp - Explicacion de la Arquitectura del Sistema

## 1. Vision General

ReciApp es un sistema de gestion de reciclaje compuesto por cinco componentes principales que se comunican a traves de una API REST centralizada desplegada en AWS:

1. **API REST** (Spring Boot) - Backend centralizado en AWS EC2
2. **App de Escritorio** (JavaFX) - Panel de administracion
3. **App Movil** (React Native / Expo) - Aplicacion para usuarios finales
4. **Terminal CLI** (Python) - Escaner de codigos de barras para puntos de reciclaje
5. **Herramientas auxiliares** (Python) - Orquestador de arranque y gestion de imagenes

---

## 2. Infraestructura Cloud (AWS)

### EC2 (Elastic Compute Cloud)
- **Instancia**: Ubuntu Server en AWS
- **Funcion**: Aloja tanto la API como la base de datos
- **Puerto**: 3000 (HTTP)

### API REST (Spring Boot)
- **Framework**: Spring Boot 3.4.4
- **Lenguaje**: Java 21
- **Seguridad**: Spring Security + JWT (JSON Web Tokens)
- **Hashing**: BCrypt para contrasenas
- **Ejecucion**: JAR ejecutable (`reciapp-api-1.0.0.jar`)

La API expone los siguientes grupos de endpoints:
| Ruta | Acceso | Descripcion |
|------|--------|-------------|
| `/api/health` | Publico | Health check |
| `/api/usuarios/login` | Publico | Autenticacion |
| `/api/usuarios/register` | Publico | Registro |
| `/api/usuarios/profile/{id}` | Autenticado | Perfil de usuario |
| `/api/productos/barcode/{code}` | Autenticado | Buscar producto por codigo de barras |
| `/api/usuarios/by-tap/{tap}` | Autenticado | Buscar usuario por tarjeta TAP |
| `/api/historial` | Autenticado | Registrar transaccion de reciclaje |
| `/api/admin/**` | Solo Admin | CRUD completo (usuarios, productos, transacciones) |

### Base de Datos (MySQL 8.x)
- **Motor**: InnoDB
- **Tablas principales**:
  - `usuarios`: id, nombre, password (BCrypt), permisos, tap, emisionesReducidas
  - `productos`: tipo + numeroBarras (PK compuesta), nombre, material, emisionesReducibles, imagen
  - `recicla`: idUsuario + tipo + numeroBarras + fecha + hora (PK compuesta)

---

## 3. App de Escritorio (JavaFX)

### Framework
- **JavaFX 25** sobre **JDK 24**
- Patron **MVC** con archivos FXML para las vistas
- Comunicacion con la API mediante `java.net.http.HttpClient`

### Librerias
| Libreria | Version | Uso |
|----------|---------|-----|
| Gson | 2.11.0 | Serializacion/deserializacion JSON |
| ControlsFX | 11.2.2 | Controles avanzados de interfaz |
| BCrypt (favre) | 0.10.2 | Hashing de contrasenas |
| JavaFX Web | 21.0.1 | WebView para contenido HTML embedido |

### Clases Propias (Utils)
| Clase | Funcion |
|-------|---------|
| `ApiClient.java` | Cliente HTTP centralizado. Gestiona todas las peticiones REST, el token JWT, y parseo de respuestas JSON. Singleton. |
| `StorageSharer.java` | Almacen estatico para compartir datos entre controladores/ventanas (items seleccionados, datos temporales). |
| `StartWin.java` | Lanzador principal de la aplicacion. Gestiona la carga de FXML, iconos, y apertura de ventanas modales. |

### Controladores principales
- `LoginController`: Pantalla de login, valida credenciales contra la API
- `MainController`: Panel principal con tabs (Perfil, Admin)
- `SingUpController`: Registro de nuevos usuarios
- Controladores de CRUD: `newProducto`, `modProducto`, `newUser`, `modUser`, `newTransaccion`, `modTransaccion`

---

## 4. App Movil (React Native / Expo)

### Framework
- **React Native 0.81.5** con **Expo SDK 54**
- **TypeScript** para tipado estatico
- **Expo Router 6** para navegacion basada en archivos

### Librerias
| Libreria | Version | Uso |
|----------|---------|-----|
| Zustand | 4.5.1 | Gestion de estado global (alternativa ligera a Redux) |
| NativeWind | latest | TailwindCSS para estilos en React Native |
| Expo Router | 6.0.10 | Navegacion basada en sistema de archivos |
| AsyncStorage | 2.2.0 | Almacenamiento local persistente (cache offline) |
| React Navigation | 7.1.6 | Navegacion nativa entre pantallas |
| Reanimated | 4.1.1 | Animaciones fluidas con el hilo nativo |
| React Native Screens | 4.16.0 | Componentes de pantalla nativos |
| pptxgenjs | 4.0.1 | Generacion de presentaciones PowerPoint |

### Clases Propias (Utils)
| Archivo | Funcion |
|---------|---------|
| `api.client.ts` | Cliente API real que conecta con el backend Spring Boot. Maneja JWT y todas las peticiones HTTP. |
| `api.offline.ts` | Servicio API de respaldo que funciona sin conexion usando AsyncStorage y datos mock. |
| `api.ts` | Interfaz abstracta que define el contrato de la API (interface `ApiService`). |
| `index.ts` (services) | Factoria que permite cambiar entre modo online y offline. |
| `authStore.ts` | Store Zustand para gestion de sesion (login, registro, logout, restauracion). |
| `productStore.ts` | Store Zustand para catalogo de productos y busqueda. |
| `recycleStore.ts` | Store Zustand para historial de reciclaje del usuario. |
| `connectionStore.ts` | Store Zustand que monitoriza el estado de la conexion a la API. |
| `config.ts` | Constantes de configuracion, mapeo de colores por material, iconos. |
| `types/index.ts` | Definiciones TypeScript de los modelos (Usuario, Producto, Recicla, etc). |

### Pantallas principales
- `(auth)/login.tsx` y `register.tsx`: Autenticacion
- `(tabs)/index.tsx`: Pantalla principal / Home
- `(tabs)/historial.tsx`: Historial de reciclaje
- `(tabs)/perfil.tsx`: Perfil del usuario
- `(tabs)/productos/index.tsx`: Catalogo de productos
- `(tabs)/productos/[barcode].tsx`: Detalle de producto (ruta dinamica)

---

## 5. App CLI - Terminal Python

La aplicacion de terminal es un conjunto de scripts Python que cubren tres funciones: el escaner de reciclaje, el orquestador de arranque del proyecto, y la gestion de imagenes de productos.

### 5.1 Terminal de Reciclaje (`terminal/reciclaje_terminal.py`)

Script principal de la CLI. Simula un punto de reciclaje fisico donde el usuario escanea un producto y pasa su tarjeta TAP para registrar la transaccion.

#### Framework / Entorno
- **Python 3.x** (stdlib + requests)
- Interfaz de terminal con colores ANSI
- Comunicacion HTTP con la API REST via la libreria `requests`

#### Librerias
| Libreria | Uso |
|----------|-----|
| `requests` | Cliente HTTP para todas las peticiones a la API (sesiones, JWT, timeouts) |
| `datetime` | Generacion de fecha/hora para las transacciones |
| `os` | Limpieza de pantalla multiplataforma (`cls` / `clear`) |

#### Clases y Funciones Propias

**Clase `ReciAppTerminal`** — Nucleo de la aplicacion:

| Metodo | Endpoint API | Descripcion |
|--------|-------------|-------------|
| `check_conexion()` | `GET /api/health` | Verifica que la API esta accesible antes de iniciar |
| `login(nombre, password)` | `POST /api/usuarios/login` | Autentica al operador del terminal y almacena el JWT |
| `buscar_producto(codigo)` | `GET /api/productos/barcode/{code}` | Busca un producto por su codigo de barras escaneado |
| `buscar_usuario_por_tap(tap)` | `GET /api/usuarios/by-tap/{tap}` | Identifica al usuario que pasa su tarjeta TAP |
| `registrar_reciclaje(id, tipo, barras)` | `POST /api/historial` | Registra la transaccion y devuelve emisiones acumuladas |

**Metodos auxiliares HTTP:**
| Metodo | Funcion |
|--------|---------|
| `_headers()` | Construye cabeceras con `Authorization: Bearer <JWT>` |
| `_get(path, params)` | Peticion GET con timeout de 10s |
| `_post(path, data)` | Peticion POST con timeout de 10s |

**Funciones de UI (terminal):**
| Funcion | Descripcion |
|---------|-------------|
| `limpiar_pantalla()` | Limpia consola (multiplataforma) |
| `mostrar_banner()` | Muestra cabecera decorativa del programa |
| `mostrar_producto(p)` | Muestra datos del producto escaneado (nombre, material, CO2) |
| `mostrar_usuario(u)` | Muestra datos del usuario identificado (nombre, emisiones) |
| `mostrar_confirmacion(r)` | Muestra resultado del reciclaje con emisiones acumuladas |

**Clase `Color`** — Codigos ANSI para colores en terminal:
- `VERDE`, `ROJO`, `AMARILLO`, `AZUL`, `CIAN`, `BLANCO`, `GRIS`, `NEGRITA`, `RESET`

#### Flujo de ejecucion
1. Verificar conexion con la API (`GET /api/health`)
2. Login del operador (credenciales por defecto o manuales, 3 reintentos)
3. Bucle principal:
   - **Paso 1/3**: Escanear codigo de barras del producto
   - **Paso 2/3**: Leer tarjeta TAP del usuario
   - **Paso 3/3**: Confirmar y registrar el reciclaje
   - Mostrar confirmacion con emisiones acumuladas
4. Escribir `salir` o `exit` para terminar

#### Variables de entorno
| Variable | Default | Descripcion |
|----------|---------|-------------|
| `RECIAPP_API_URL` | `http://52.201.91.206:3000` | URL base de la API |
| `RECIAPP_ADMIN_USER` | `terminal` | Usuario operador del terminal |
| `RECIAPP_ADMIN_PASS` | `1234` | Contrasena del operador |

---

### 5.2 Orquestador de Arranque (`start.py`)

Script maestro que arranca toda la infraestructura de desarrollo (API + Expo) desde Windows.

#### Librerias (stdlib)
| Libreria | Uso |
|----------|-----|
| `subprocess` | Lanzar procesos (API en WSL, Expo Metro) |
| `threading` | Streaming asincrono de la salida de los procesos |
| `urllib.request` | Health checks HTTP a la API |
| `platform` | Deteccion de SO (solo funciona en Windows) |
| `signal` | Manejo de Ctrl+C para limpieza de procesos |
| `time` | Intervalos de polling para health check |

#### Modos de ejecucion
| Flag | Modo | Descripcion |
|------|------|-------------|
| (ninguno) | EC2 remoto | Usa la API desplegada en AWS, solo arranca Expo |
| `--local` / `-l` | Local Spring Boot | Arranca la API con Gradle en WSL + Expo |
| `--express` / `-e` | Local Express | Arranca la API Express en WSL + Expo |

#### Funciones principales
| Funcion | Descripcion |
|---------|-------------|
| `check_api(host)` | Verifica `/api/health` con urllib (sin dependencias externas) |
| `get_wsl_path(path)` | Convierte rutas Windows a formato WSL (`/mnt/c/...`) |
| `run_ec2_mode(...)` | Conecta a API remota en EC2, solo verifica conectividad |
| `run_local_mode(...)` | Lanza API en WSL (Spring Boot o Express) |
| `main()` | Punto de entrada: parsea flags, arranca procesos, monitoriza |

#### Configuracion
| Constante | Valor | Descripcion |
|-----------|-------|-------------|
| `EC2_IP` | `52.201.91.206` | IP del servidor AWS |
| `API_PORT` | `3000` | Puerto de la API |
| `MAX_WAIT` | `120` | Timeout en segundos para esperar a la API |
| `CHECK_INTERVAL` | `2` | Intervalo de polling del health check |

---

### 5.3 Gestion de Imagenes (`tools/gestionar_imagenes.py`)

Herramienta CLI para gestionar las imagenes de productos directamente en la base de datos MySQL.

#### Librerias
| Libreria | Uso |
|----------|-----|
| `mysql-connector-python` | Conexion directa a MySQL (sin pasar por la API) |
| `base64` | Codificacion de imagenes a Base64 para almacenar en BD |
| `mimetypes` | Deteccion automatica del tipo MIME de la imagen |

#### Funciones principales
| Funcion | Descripcion |
|---------|-------------|
| `conectar()` | Establece conexion MySQL (host: localhost, user: root, db: reciInventario_db) |
| `listar_productos(conn)` | Lista todos los productos con su estado de imagen |
| `seleccionar_producto(productos)` | Menu interactivo para seleccionar un producto |
| `subir_imagen(conn, producto)` | Lee archivo de imagen, lo convierte a `data:{mime};base64,{data}` y hace UPDATE |
| `eliminar_imagen(conn, producto)` | Hace `UPDATE SET Imagen = NULL` para el producto seleccionado |
| `menu_producto(conn, producto)` | Menu con opciones: subir, eliminar, volver |

#### Nota importante
Este script se conecta **directamente a MySQL** (no a traves de la API), por lo que solo funciona cuando se tiene acceso directo a la base de datos (desarrollo local o SSH tunnel a EC2).

---

### 5.4 Generador de PDF (`docs/generate_pdf.py`)

Script auxiliar que genera documentacion en PDF sobre las sesiones de debug del proyecto.

#### Librerias
| Libreria | Uso |
|----------|-----|
| `reportlab` | Generacion de PDF profesional (estilos, tablas, multi-pagina) |

#### Contenido generado
- Portada con informacion del proyecto
- Tabla de tecnologias
- Problemas documentados con sintomas, causas y soluciones
- Tabla de archivos modificados
- Arquitectura de despliegue
- Referencia de comandos
- Endpoints de la API
- Esquema de base de datos

**Salida**: `docs/sesion-debug-reciapp.pdf`

---

## 6. Flujo de Comunicacion

### Autenticacion
1. El usuario introduce nombre y contrasena en cualquier app (escritorio, movil o terminal)
2. La app envia `POST /api/usuarios/login` con las credenciales
3. La API valida con BCrypt y genera un JWT con claims `sub` (userId) y `permisos`
4. El JWT se almacena en la app y se envia en la cabecera `Authorization: Bearer <token>` en cada peticion

### Autorizacion
- **Rutas publicas**: `/api/health`, `/api/usuarios/login`, `/api/usuarios/register`
- **Rutas autenticadas**: Requieren JWT valido (`/api/usuarios/profile/{id}`, `/api/productos/barcode/{code}`, `/api/usuarios/by-tap/{tap}`, `/api/historial`)
- **Rutas admin**: Requieren JWT con `permisos=administrador` (`/api/admin/**`)
- El `JwtAuthFilter` intercepta cada peticion, extrae el token, valida la firma, y establece el `SecurityContext` con el rol `ROLE_ADMINISTRADOR` o `ROLE_CLIENTE`

### Flujo del Terminal de Reciclaje
1. El operador arranca `reciclaje_terminal.py`
2. El script verifica la conexion (`GET /api/health`)
3. El operador se autentica con sus credenciales
4. En bucle:
   - Se escanea el codigo de barras → `GET /api/productos/barcode/{code}` devuelve el producto
   - El usuario pasa su tarjeta TAP → `GET /api/usuarios/by-tap/{tap}` devuelve el usuario
   - Se confirma el reciclaje → `POST /api/historial` registra la transaccion y actualiza emisiones

### Operaciones CRUD
La app de escritorio realiza operaciones CRUD sobre usuarios, productos y transacciones a traves de los endpoints `/api/admin/*`. Al crear una transaccion de reciclaje, la API actualiza automaticamente las emisiones reducidas del usuario correspondiente.

---

## 7. Resumen de Tecnologias

| Componente | Tecnologia | Lenguaje |
|-----------|------------|----------|
| API Backend | Spring Boot 3.4.4 | Java 21 |
| Base de Datos | MySQL 8.x (InnoDB) | SQL |
| App Escritorio | JavaFX 25 | Java 24 |
| App Movil | React Native 0.81 + Expo 54 | TypeScript |
| Terminal CLI | reciclaje_terminal.py | Python 3.x |
| Orquestador | start.py | Python 3.x |
| Gestion Imagenes | gestionar_imagenes.py | Python 3.x |
| Generador Docs | generate_pdf.py | Python 3.x |
| Cloud | AWS EC2 (Ubuntu) | - |
| Seguridad | JWT + BCrypt + Spring Security | - |

## 8. Dependencias Python (sin requirements.txt)

| Paquete | Usado por | Instalacion |
|---------|-----------|-------------|
| `requests` | reciclaje_terminal.py | `pip install requests` |
| `mysql-connector-python` | gestionar_imagenes.py | `pip install mysql-connector-python` |
| `reportlab` | generate_pdf.py | `pip install reportlab` |
| (stdlib) | start.py | No requiere instalacion |
