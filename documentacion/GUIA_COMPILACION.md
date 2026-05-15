# Guia de Compilacion - Instaladores ReciApp

## 1. App de Escritorio (Windows - JavaFX)

### 1.1 Requisitos

| Requisito | Version | Notas |
|-----------|---------|-------|
| JDK | 24 | Para compilar, ejecutar jpackage y generar el JRE embebido |
| JavaFX | 25 | Declarado via plugin `org.openjfx.javafxplugin` en Gradle |
| Gradle | 8.8 | Wrapper incluido en el proyecto (`gradlew.bat`) |
| WiX Toolset | 3.14 | Necesario para generar instaladores .exe/.msi (requiere admin para instalar) |

### 1.2 Instalacion de WiX Toolset

jpackage del JDK delega la creacion de instaladores Windows (.exe y .msi) a WiX Toolset. Sin WiX, jpackage solo puede generar un "app-image" (carpeta portable con .exe), pero no un instalador grafico con wizard.

**Que es WiX Toolset**: Es un conjunto de herramientas open-source que compila archivos XML (.wxs) en instaladores MSI y EXE de Windows Installer. jpackage genera automaticamente los archivos .wxs a partir del app-image y luego invoca `candle.exe` (compilador WiX) y `light.exe` (linker WiX) para producir el instalador final.

**Instalacion via winget** (requiere terminal con permisos de administrador):

```powershell
winget install WiXToolset.WiXToolset --version 3.14.1.8722 --accept-package-agreements
```

**Instalacion manual** (alternativa, muestra UAC):

```powershell
# Descargar el instalador
Invoke-WebRequest -Uri "https://github.com/wixtoolset/wix3/releases/download/wix3141rtm/wix314.exe" -OutFile "$env:TEMP\wix314.exe"

# Ejecutar con elevacion de administrador (aparece dialogo UAC)
Start-Process "$env:TEMP\wix314.exe" -ArgumentList "/install","/quiet","/norestart" -Verb RunAs -Wait
```

**Verificacion**: Tras la instalacion, los binarios quedan en:

```
C:\Program Files (x86)\WiX Toolset v3.14\bin\candle.exe   (compilador)
C:\Program Files (x86)\WiX Toolset v3.14\bin\light.exe    (linker)
```

**Importante**: jpackage busca WiX en el PATH del sistema. Si no lo encuentra automaticamente, hay que anadir la ruta al PATH antes de ejecutar el build:

```powershell
$env:PATH = "C:\Program Files (x86)\WiX Toolset v3.14\bin;$env:PATH"
```

**Nota sobre versiones**: jpackage del JDK 24 es compatible con WiX 3.x (probado con 3.14). WiX 4.x y 7.x tienen una arquitectura diferente y NO son compatibles con jpackage.

### 1.3 Plugin de empaquetado (badass-runtime-plugin)

Se usa el plugin `org.beryx.runtime` v1.13.1 (conocido como badass-runtime-plugin). Este plugin orquesta tres pasos:

1. **jlink**: Genera un JRE reducido con solo los modulos Java necesarios
2. **jpackageImage**: Crea un app-image (carpeta con .exe + JRE + JARs)
3. **jpackage**: Invoca jpackage del JDK para crear el instalador .exe/.msi usando WiX

Configuracion completa en `app/build.gradle`:

```groovy
plugins {
    id 'application'
    id 'org.openjfx.javafxplugin' version '0.1.0'
    id 'org.beryx.runtime' version '1.13.1'
}

runtime {
    options = [
        '--strip-debug',       // Elimina info de depuracion del JRE (reduce tamano)
        '--compress', '2',     // Compresion ZIP de los modulos
        '--no-header-files',   // No incluir headers C (no necesarios en runtime)
        '--no-man-pages',      // No incluir paginas man
    ]

    // Modulos JDK que se incluyen en el JRE embebido via jlink.
    // IMPORTANTE: JavaFX NO es parte del JDK, asi que no se incluye aqui.
    // JavaFX se carga desde el module-path en tiempo de ejecucion (ver imageOptions).
    // jdk.unsupported.desktop es requerido por javafx.swing.
    modules = [
        'java.base', 'java.desktop', 'java.logging', 'java.naming',
        'java.net.http', 'java.sql', 'java.xml', 'java.scripting',
        'java.management', 'jdk.jsobject', 'jdk.xml.dom', 'jdk.unsupported',
        'jdk.unsupported.desktop',
    ]

    jpackage {
        appVersion = '1.0.0'
        imageName = 'ReciApp'           // Nombre del app-image
        installerName = 'ReciApp'       // Nombre del archivo instalador
        imageOptions = [
            '--icon', "${project.projectDir}/src/main/resources/icon.ico",
            // JavaFX no esta en el JRE jlinked. Estos flags hacen que java.exe
            // cargue los modulos JavaFX desde los JARs que estan en $APPDIR:
            '--java-options', '--module-path',
            '--java-options', '$APPDIR',
            '--java-options', '--add-modules=javafx.base,javafx.controls,javafx.fxml,javafx.graphics,javafx.media,javafx.swing,javafx.web',
            '--java-options', '--add-exports=javafx.base/com.sun.javafx.event=ALL-UNNAMED',
            '--java-options', '-Dfile.encoding=UTF-8',
        ]
        installerOptions = [
            '--win-dir-chooser',         // Permite al usuario elegir directorio de instalacion
            '--win-menu',                // Crea entrada en el menu Inicio
            '--win-shortcut',            // Crea acceso directo en el escritorio
            '--win-shortcut-prompt',     // Pregunta al usuario si quiere el acceso directo
            '--vendor', 'ReciApp',       // Nombre del fabricante
            '--description', 'Aplicacion de escritorio para gestion de reciclaje',
            '--icon', "${project.projectDir}/src/main/resources/icon.ico",
        ]
    }
}
```

### 1.4 Generacion del instalador grafico (.exe/.msi)

```powershell
# 1. Asegurar que WiX esta en el PATH
$env:PATH = "C:\Program Files (x86)\WiX Toolset v3.14\bin;$env:PATH"

# 2. Ir a la raiz del proyecto de escritorio
cd C:\Users\FA506NC\Desktop\ReciInventario_DIST\source\ActualAgain

# 3. Generar el instalador (compila, crea JRE, crea app-image, genera .exe y .msi)
.\gradlew.bat :app:jpackage
```

**Tareas Gradle que se ejecutan en cadena**:

| Tarea | Que hace |
|-------|----------|
| `:app:compileJava` | Compila el codigo fuente Java |
| `:app:jar` | Empaqueta las clases en un JAR |
| `:app:jre` | Genera un JRE reducido con jlink (solo modulos declarados) |
| `:app:jpackageImage` | Crea el app-image: carpeta con ReciApp.exe + JRE + dependencias |
| `:app:jpackage` | Invoca jpackage con WiX para crear el instalador .exe y .msi |

**Tiempo de compilacion**: ~1-2 minutos (la mayor parte la consume jpackage/WiX).

### 1.5 Resultado

Los instaladores se generan en `app/build/jpackage/`:

| Archivo | Tamano | Descripcion |
|---------|--------|-------------|
| `ReciApp-1.0.0.exe` | ~100 MB | Instalador EXE con wizard grafico (elige directorio, menu Inicio, acceso directo) |
| `ReciApp-1.0.0.msi` | ~99 MB | Instalador MSI de Windows Installer (despliegue silencioso, GPO corporativo) |

**Diferencia entre EXE y MSI**:
- El **EXE** es un wrapper bootstrapper que muestra un wizard grafico y ejecuta el MSI internamente.
- El **MSI** es el paquete nativo de Windows Installer; se puede instalar en silencio con `msiexec /i ReciApp-1.0.0.msi /quiet` y desplegarse via GPO en entornos corporativos.

Ambos instalan lo mismo: ReciApp.exe con JRE embebido en `C:\Program Files\ReciApp\`.

### 1.6 Generacion alternativa: ZIP portable (sin WiX)

Si WiX no esta disponible, se puede generar solo el app-image portable:

```powershell
# Genera solo la carpeta portable (no necesita WiX)
.\gradlew.bat :app:runtime

# Comprimir como ZIP
Compress-Archive -Path "app\build\jpackage\ReciApp" -DestinationPath "ReciApp-Windows-Portable.zip"
```

Resultado: un ZIP de ~98 MB que el usuario descomprime y ejecuta `ReciApp.exe` directamente, sin instalacion.

### 1.7 JavaFX y el JRE embebido (problema critico)

JavaFX **no forma parte del JDK** desde Java 11. Se distribuye como dependencia Maven separada (JARs modulares). Esto crea un problema con jpackage:

- **jlink** (que genera el JRE embebido) solo puede incluir modulos del JDK. Los modulos de JavaFX (`javafx.base`, `javafx.controls`, etc.) no estan disponibles para jlink.
- Los JARs de JavaFX se copian a la carpeta `app/` junto con el resto de dependencias, pero sin estar en el module path, Java no puede cargar JavaFX y el error es: `JavaFX runtime components are missing`.

**Solucion**: Se configuran opciones JVM en el launcher para que Java cargue JavaFX desde los JARs:

```
--module-path $APPDIR                     (apunta a la carpeta app/ donde estan los JARs)
--add-modules javafx.base,javafx.controls,javafx.fxml,...  (carga los modulos JavaFX)
```

Esto se configura en `imageOptions` del bloque `jpackage` de `build.gradle` usando `--java-options`.

**Modulo adicional requerido**: `javafx.swing` depende de `jdk.unsupported.desktop`, un modulo del JDK que no se incluye por defecto. Hay que anadirlo explicitamente a la lista `modules` del bloque `runtime`.

### 1.8 Icono de la aplicacion

El icono `.ico` (requerido por jpackage para Windows) se genero a partir del logo PNG del proyecto usando Pillow:

```python
from PIL import Image
img = Image.open("logo.png")
sizes = [(16,16), (32,32), (48,48), (64,64), (128,128), (256,256)]
icons = [img.resize(s, Image.LANCZOS) for s in sizes]
icons[0].save("icon.ico", format="ICO", sizes=sizes, append_images=icons[1:])
```

El archivo resultante se guarda en `app/src/main/resources/icon.ico` y se referencia en `build.gradle`.

---

## 2. App Movil (Android APK - React Native / Expo)

### 2.1 Requisitos

| Requisito | Version | Notas |
|-----------|---------|-------|
| Node.js | 18+ | Para npm y Metro bundler |
| Android SDK | 35 | platform-tools, build-tools |
| Android NDK | 27.1.12297006 | Compilacion nativa C++ para modulos React Native |
| CMake | 3.22.1 | Build system usado por los modulos nativos |
| JDK | **17** | NO usar JDK 24 (ver seccion 2.2) |

### 2.2 Incompatibilidad JDK 24 con Android Gradle Plugin

El JDK 24 introduce restricciones sobre metodos nativos (`java.lang.System::load`) que rompen la fase de configuracion de CMake del Android Gradle Plugin. Las tareas `configureCMakeRelWithDebInfo` de modulos como `react-native-screens`, `react-native-worklets` y `expo-modules-core` fallan con:

```
Execution failed for task ':react-native-screens:configureCMakeRelWithDebInfo[arm64-v8a]'.
> WARNING: A restricted method in java.lang.System has been called
```

**Solucion**: Usar JDK 17 para la compilacion Android. Se configura en `android/gradle.properties`:

```properties
org.gradle.java.home=C:\\Program Files\\Microsoft\\jdk-17.0.17.10-hotspot
```

### 2.3 Instalacion del Android NDK

Si el NDK no esta presente o el directorio esta vacio, se instala via sdkmanager:

```powershell
# Si sdkmanager no existe, instalar command-line tools primero:
# Descargar de: https://developer.android.com/studio#command-line-tools-only
# Extraer el ZIP en: %LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\

# Instalar NDK (~1.5 GB)
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" --install "ndk;27.1.12297006"
```

**Nota**: Si sdkmanager instala el NDK en una carpeta con sufijo (ej. `27.1.12297006-2`) porque la original existia, hay que renombrarla:

```powershell
Remove-Item "$env:ANDROID_HOME\ndk\27.1.12297006" -Recurse -Force
Rename-Item "$env:ANDROID_HOME\ndk\27.1.12297006-2" "27.1.12297006"
```

### 2.4 Dependencias npm faltantes

Antes de compilar, verificar que todas las dependencias estan en `node_modules`:

```bash
npm install
```

Dependencias que pueden faltar (estaban en `package.json` pero no instaladas):
- `@react-native-async-storage/async-storage` - persistencia local
- `react-native-paper` + `react-native-vector-icons` - componentes Material Design

Ademas, se creo `services/database.ts` como capa wrapper sobre `RealApiService` que devuelve respuestas `{ success, data, error }` para las pantallas.

### 2.5 Proceso de generacion del APK

```powershell
cd C:\Users\FA506NC\Downloads\reciapp\reci_app

# 1. Instalar dependencias npm
npm install

# 2. Generar proyecto nativo Android desde Expo (crea la carpeta android/)
npx expo prebuild --platform android

# 3. Configurar android/gradle.properties:
#    org.gradle.java.home=C:\\Program Files\\Microsoft\\jdk-17.0.17.10-hotspot
#    reactNativeArchitectures=arm64-v8a

# 4. Compilar el APK release
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot"
cd android
.\gradlew.bat assembleRelease
```

**Tiempo de compilacion**: ~3-6 minutos (depende de si los modulos nativos C++ necesitan recompilarse).

### 2.6 Resultado

```
android/app/build/outputs/apk/release/app-release.apk
```

Tamano: **~50 MB** (arquitecturas arm64-v8a + x86_64).

### 2.7 Configuracion de arquitecturas

En `android/gradle.properties`:

| Configuracion | Tamano APK | Soporte |
|--------------|-----------|---------|
| `arm64-v8a` | ~30 MB | Solo dispositivos fisicos modernos |
| `arm64-v8a,x86_64` (actual) | ~50 MB | Dispositivos modernos + emuladores x86_64 |
| `armeabi-v7a,arm64-v8a,x86,x86_64` | ~80-100 MB | Todos los dispositivos + todos los emuladores |

> **Nota:** La arquitectura `x86_64` es necesaria para ejecutar en emuladores Android de PC. Sin ella, la APK se instala pero crashea con `SoLoaderDSONotFoundError` porque el SoLoader de React Native no puede usar la traduccion ARM del emulador.

### 2.8 Trafico HTTP en release builds

Android bloquea conexiones HTTP (sin TLS) por defecto en builds release desde API 28. Como el backend usa `http://52.201.91.206:3000`, hay que habilitar cleartext traffic en el AndroidManifest principal (`android/app/src/main/AndroidManifest.xml`):

```xml
<application ... android:usesCleartextTraffic="true">
```

> **Importante:** Los manifests de `debug/` y `debugOptimized/` ya lo tienen, pero el de `main/` no. Sin este flag la app conecta en debug pero falla silenciosamente en release.

### 2.9 PaperProvider en el root layout

La pantalla de ajustes/perfil usa componentes de `react-native-paper` que requieren un `PaperProvider` en el arbol de componentes raiz. Se anadio en `app/_layout.tsx`:

```tsx
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <RootLayoutNav />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
```

### 2.10 Rutas duplicadas y tabs ocultos

Se elimino `app/(tabs)/productos.tsx` porque conflictuaba con `app/(tabs)/productos/index.tsx` (ambos generaban una pantalla llamada `productos`). La version correcta es la del directorio que tiene Stack navigator con detalle de producto.

Se ocultaron las pantallas `index.tsx` y `ajustes.tsx` de la barra de tabs con `href: null` en `app/(tabs)/_layout.tsx`.

### 2.11 Firma del APK

El APK usa la clave de depuracion por defecto. Para publicar en Google Play:

1. Generar keystore: `keytool -genkey -v -keystore release.keystore -alias reciapp -keyalg RSA -keysize 2048`
2. Configurar en `android/app/build.gradle` bajo `signingConfigs`
3. Recompilar con `assembleRelease`

---

## 3. Resumen de archivos generados

| Plataforma | Archivo | Tamano | Tipo |
|-----------|---------|--------|------|
| Windows (instalador EXE) | ReciApp-1.0.0-Setup.exe | ~100 MB | Instalador grafico con wizard |
| Windows (instalador MSI) | ReciApp-1.0.0.msi | ~99 MB | Windows Installer (despliegue silencioso) |
| Windows (portable) | ReciApp-Windows-Portable.zip | ~98 MB | ZIP autocontenido sin instalacion |
| Android | ReciApp-release.apk | ~30 MB | APK instalable directamente |

## 4. Problemas encontrados y soluciones

| Problema | Causa | Solucion |
|----------|-------|----------|
| `Can not find WiX tools` al ejecutar jpackage | WiX Toolset no instalado | Instalar WiX 3.14 via `wix314.exe` (requiere admin) |
| `winget install` falla con "requiere admin" | winget necesita terminal elevada | Descargar el .exe desde GitHub y ejecutar con `-Verb RunAs` |
| CMake falla con `restricted method` | JDK 24 restringe `java.lang.System::load` | Usar JDK 17 para builds Android |
| NDK vacio (solo `source.properties`) | Directorio existia sin contenido real | Reinstalar via `sdkmanager --install "ndk;27.1.12297006"` |
| NDK instalado en carpeta con sufijo `-2` | sdkmanager no sobreescribe carpeta existente | Borrar la vieja y renombrar la nueva |
| sdkmanager no disponible | Android command-line tools no instaladas | Descargar e instalar desde dl.google.com |
| `Unable to resolve module services/database` | Archivo no existia en el proyecto | Crear `services/database.ts` como wrapper |
| `react-native-paper` no encontrado | Faltaba en node_modules | `npm install react-native-paper react-native-vector-icons` |
| Nombre del instalador era `app-1.0.0.exe` | Faltaba `installerName` en build.gradle | Anadir `installerName = 'ReciApp'` al bloque jpackage |
| `JavaFX runtime components are missing` | JavaFX no es parte del JDK; jlink no lo incluye en el JRE embebido | Anadir `--module-path $APPDIR` y `--add-modules=javafx.*` en `imageOptions` de jpackage |
| `Module jdk.unsupported.desktop not found` | `javafx.swing` requiere este modulo JDK que no estaba en la lista | Anadir `jdk.unsupported.desktop` a la lista de `modules` del bloque runtime |
| `SoLoaderDSONotFoundError: libreactnative.so` | APK solo tenia `arm64-v8a` pero el emulador es `x86_64` | Anadir `x86_64` a `reactNativeArchitectures` en `gradle.properties` |
| `Network request failed` en release (pero no en debug) | Android bloquea HTTP sin TLS en release builds desde API 28 | Anadir `android:usesCleartextTraffic="true"` al AndroidManifest principal |
| `forgot to wrap root with Provider (react-native-paper)` | Pantalla de ajustes usa Paper sin PaperProvider en el root | Envolver `RootLayoutNav` con `<PaperProvider>` en `app/_layout.tsx` |
| `duplicate screen named 'productos'` | `productos.tsx` y `productos/index.tsx` creaban la misma ruta | Eliminar `app/(tabs)/productos.tsx` (la version correcta es el directorio) |
| Tabs extra "index" y "ajustes" en la barra inferior | Expo Router auto-registra todos los archivos en `(tabs)/` | Ocultarlos con `href: null` en el `_layout.tsx` de tabs |
