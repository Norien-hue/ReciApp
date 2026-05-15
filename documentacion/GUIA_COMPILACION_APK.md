# Guia de Compilacion de la APK - ReciApp

Este documento explica paso a paso como se genero la APK de ReciApp para Android, incluyendo todos los problemas encontrados y las soluciones aplicadas.

---

## 1. Requisitos previos

| Requisito | Version | Ruta por defecto | Notas |
|-----------|---------|-----------------|-------|
| Node.js | 18+ | -- | Para npm y Metro bundler |
| JDK | **17** | `C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot` | **No usar JDK 24** (ver seccion 3.1) |
| Android SDK | 35 | `%LOCALAPPDATA%\Android\Sdk` | platform-tools, build-tools |
| Android NDK | 27.1.12297006 | `%LOCALAPPDATA%\Android\Sdk\ndk\27.1.12297006` | Compilacion nativa C++ |
| CMake | 3.22.1 | Dentro del SDK | Build system para modulos nativos |

### 1.1 Instalar JDK 17 (si no lo tienes)

```powershell
winget install Microsoft.OpenJDK.17
```

### 1.2 Instalar Android NDK y CMake (si no los tienes)

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# Instalar NDK (~1.5 GB)
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" --install "ndk;27.1.12297006"

# Instalar CMake
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" --install "cmake;3.22.1"
```

> **Nota:** Si sdkmanager instala el NDK en una carpeta con sufijo (ej. `27.1.12297006-2`), hay que renombrarla:
> ```powershell
> Remove-Item "$env:ANDROID_HOME\ndk\27.1.12297006" -Recurse -Force
> Rename-Item "$env:ANDROID_HOME\ndk\27.1.12297006-2" "27.1.12297006"
> ```

---

## 2. Preparacion del proyecto

### 2.1 Instalar dependencias npm

```powershell
cd C:\Users\FA506NC\Downloads\reciapp\reci_app
npm install
```

Dependencias criticas que pueden faltar (estan en `package.json` pero no siempre se instalan):
- `react-native-paper` + `react-native-vector-icons` — componentes Material Design
- `@react-native-async-storage/async-storage` — persistencia local

Si faltan, instalar manualmente:

```powershell
npm install react-native-paper react-native-vector-icons @react-native-async-storage/async-storage
```

### 2.2 Generar proyecto nativo Android (expo prebuild)

Expo trabaja en modo "managed", pero para generar una APK necesitamos el proyecto nativo Android:

```powershell
npx expo prebuild --platform android
```

Esto crea la carpeta `android/` con el proyecto Gradle nativo. Si ya existe, se puede forzar la regeneracion con `--clean`.

### 2.3 Configurar gradle.properties

Editar `android/gradle.properties` y asegurar que estas lineas estan presentes:

```properties
# JDK 17 para compilacion Android (JDK 24 rompe CMake del AGP)
org.gradle.java.home=C:\\Program Files\\Microsoft\\jdk-17.0.17.10-hotspot

# Memoria para el daemon de Gradle
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m --enable-native-access=ALL-UNNAMED

# Arquitecturas a incluir en la APK
# arm64-v8a = dispositivos fisicos modernos
# x86_64 = emuladores Android en PC
reactNativeArchitectures=arm64-v8a,x86_64
```

> **Sobre arquitecturas:** Si solo vas a distribuir a moviles reales, puedes usar solo `arm64-v8a` para reducir el tamano de la APK (~30 MB vs ~50 MB). Si necesitas probarlo en un emulador, incluye `x86_64`.

### 2.4 Habilitar trafico HTTP en el AndroidManifest

El backend de ReciApp usa HTTP (no HTTPS). Android bloquea trafico HTTP en builds release por defecto (desde API 28). Hay que asegurar que `android:usesCleartextTraffic="true"` esta en el manifiesto principal:

En `android/app/src/main/AndroidManifest.xml`, verificar que el tag `<application>` incluye:

```xml
<application
    ...
    android:usesCleartextTraffic="true">
```

> **Importante:** Los manifests de `debug/` y `debugOptimized/` ya lo tienen, pero el de `main/` (que usa release) no lo incluye por defecto. Sin este flag, la app conectara en debug pero fallara silenciosamente en release con `TypeError: Network request failed`.

---

## 3. Compilacion

### 3.1 Compilar la APK release

```powershell
cd C:\Users\FA506NC\Downloads\reciapp\reci_app\android

# Variables de entorno necesarias
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot"

# Compilar
.\gradlew.bat assembleRelease
```

**Tiempo de compilacion:** ~3-6 minutos la primera vez (compila modulos nativos C++). Builds subsiguientes tardan ~1-2 minutos.

### 3.2 Resultado

La APK se genera en:

```
android/app/build/outputs/apk/release/app-release.apk
```

Tamano aproximado:
- Solo `arm64-v8a`: ~30 MB
- `arm64-v8a` + `x86_64`: ~50 MB

### 3.3 Copiar la APK al escritorio (opcional)

```powershell
Copy-Item "android\app\build\outputs\apk\release\app-release.apk" "$env:USERPROFILE\Desktop\ReciApp-release.apk"
```

---

## 4. Bugs encontrados y corregidos durante el proceso

### 4.1 JDK 24 rompe la compilacion de CMake

**Error:**
```
Execution failed for task ':react-native-screens:configureCMakeRelWithDebInfo[arm64-v8a]'.
> WARNING: A restricted method in java.lang.System has been called
```

**Causa:** JDK 24 introduce restricciones sobre `java.lang.System::load` que rompen la configuracion de CMake del Android Gradle Plugin.

**Solucion:** Usar JDK 17 configurando `org.gradle.java.home` en `gradle.properties`.

### 4.2 Pantalla duplicada "productos" causaba crash al navegar a los tabs

**Error:**
```
Error: A navigator cannot contain multiple 'Screen' components with the same name
(found duplicate screen named 'productos')
```

**Causa:** Existian dos archivos que generaban la misma ruta:
- `app/(tabs)/productos.tsx` — archivo suelto
- `app/(tabs)/productos/index.tsx` — dentro de un directorio

Expo Router registra ambos como pantalla `'productos'`.

**Solucion:** Eliminar el archivo suelto `app/(tabs)/productos.tsx`. La version correcta es la del directorio `productos/` que tiene su propio `_layout.tsx` con Stack navigator para la lista y el detalle de producto.

### 4.3 Faltaba PaperProvider en el root layout

**Error:**
```
Error: Looks like you forgot to wrap your root component with `Provider`
component from `react-native-paper`.
```

**Causa:** La pantalla de ajustes usa componentes de `react-native-paper` (Dialog, Portal, etc.) que requieren un Provider en el arbol de componentes.

**Solucion:** Anadir `<PaperProvider>` al root layout (`app/_layout.tsx`):

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

### 4.4 Tabs extra "index" y "ajustes" aparecian en la barra de navegacion

**Causa:** Expo Router auto-registra todos los archivos dentro de `(tabs)/` como tabs. Los archivos `index.tsx` y `ajustes.tsx` aparecian como tabs no deseados.

**Solucion:** Ocultarlos en el layout de tabs con `href: null`:

```tsx
<Tabs.Screen name="index" options={{ href: null }} />
<Tabs.Screen name="ajustes" options={{ href: null }} />
```

### 4.5 La APK no conectaba al backend (Network request failed)

**Causa:** Android bloquea trafico HTTP sin TLS en builds release. El manifiesto de `debug/` tenia `usesCleartextTraffic="true"` pero el de `main/` no.

**Solucion:** Anadir `android:usesCleartextTraffic="true"` al `AndroidManifest.xml` principal (ver seccion 2.4).

### 4.6 La APK crasheaba en el emulador (SoLoaderDSONotFoundError)

**Error:**
```
SoLoaderDSONotFoundError: couldn't find DSO to load: libreactnative.so
```

**Causa:** La APK se compilo solo con `arm64-v8a` pero el emulador es `x86_64`. Aunque los emuladores con Google Play tienen traduccion ARM, no funciona con el SoLoader de React Native.

**Solucion:** Anadir `x86_64` a las arquitecturas en `gradle.properties`:

```properties
reactNativeArchitectures=arm64-v8a,x86_64
```

### 4.7 NDK no encontrado o directorio vacio

**Causa:** El directorio del NDK existia pero estaba vacio (solo contenia `source.properties`).

**Solucion:** Reinstalar via `sdkmanager --install "ndk;27.1.12297006"` y renombrar si tiene sufijo.

### 4.8 Modulo services/database no encontrado

**Error:**
```
Unable to resolve module services/database
```

**Causa:** El archivo no existia en el proyecto.

**Solucion:** Crear `services/database.ts` como wrapper sobre `RealApiService` que devuelve respuestas `{ success, data, error }`.

---

## 5. Firma de la APK

La APK actual usa la clave de depuracion por defecto (`debug.keystore`). Para publicar en Google Play:

```powershell
# 1. Generar keystore de produccion
keytool -genkey -v -keystore release.keystore -alias reciapp -keyalg RSA -keysize 2048 -validity 10000

# 2. Configurar en android/app/build.gradle bajo signingConfigs
# 3. Recompilar con assembleRelease
```

---

## 6. Resumen de comandos (copia-pega rapido)

```powershell
# === PREPARACION (solo la primera vez) ===
cd C:\Users\FA506NC\Downloads\reciapp\reci_app
npm install
npx expo prebuild --platform android

# === COMPILACION ===
cd android
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot"
.\gradlew.bat assembleRelease

# === COPIAR AL ESCRITORIO ===
Copy-Item "app\build\outputs\apk\release\app-release.apk" "$env:USERPROFILE\Desktop\ReciApp-release.apk"

# === INSTALAR EN EMULADOR ===
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r "$env:USERPROFILE\Desktop\ReciApp-release.apk"
```

---

## 7. Archivos modificados durante el proceso

| Archivo | Cambio realizado |
|---------|-----------------|
| `android/gradle.properties` | JDK 17, arquitecturas arm64-v8a+x86_64, memoria |
| `android/app/src/main/AndroidManifest.xml` | `usesCleartextTraffic="true"` |
| `app/_layout.tsx` | Anadido `<PaperProvider>` al root |
| `app/(tabs)/_layout.tsx` | Ocultar tabs `index` y `ajustes` con `href: null` |
| `app/(tabs)/productos.tsx` | **Eliminado** (conflicto con `productos/index.tsx`) |
| `services/database.ts` | **Creado** como wrapper de RealApiService |
