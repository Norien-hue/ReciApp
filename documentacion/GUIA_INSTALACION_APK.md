# Guia de Instalacion de la APK de ReciApp

Esta guia explica como instalar la APK de ReciApp en un emulador Android o en un dispositivo fisico.

---

## 1. Instalacion en un Emulador Android

### 1.1 Requisitos

| Requisito | Ruta por defecto | Notas |
|-----------|-----------------|-------|
| Android SDK | `%LOCALAPPDATA%\Android\Sdk` | Incluye platform-tools (adb) |
| Un AVD (Android Virtual Device) creado | -- | Recomendado: Pixel 8 API 35 con Google Play Store |
| La APK compilada | `ReciApp-release.apk` | Ver GUIA_COMPILACION_APK.md para generarla |

### 1.2 Crear un emulador (si no tienes uno)

Si no tienes un emulador creado, puedes hacerlo con `avdmanager`:

```powershell
# Variables de entorno necesarias
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot"

# Listar system images disponibles
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" --list | Select-String "system-images"

# Instalar una system image (si no la tienes)
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" --install "system-images;android-35;google_apis_playstore;x86_64"

# Crear el AVD
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\avdmanager.bat" create avd `
    --name "Pixel_8_API_35" `
    --package "system-images;android-35;google_apis_playstore;x86_64" `
    --device "pixel_8"
```

### 1.3 Arrancar el emulador

```powershell
# Listar emuladores disponibles
& "$env:ANDROID_HOME\emulator\emulator.exe" -list-avds

# Arrancar el emulador (sustituir por el nombre de tu AVD)
& "$env:ANDROID_HOME\emulator\emulator.exe" -avd Pixel_8_API_35
```

> **Nota:** El emulador tarda 1-2 minutos en arrancar completamente. Espera a ver la pantalla de inicio de Android antes de instalar la APK.

### 1.4 Verificar que el emulador esta conectado

Abre **otra terminal** (no la del emulador) y ejecuta:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
```

Debe mostrar algo como:

```
List of devices attached
emulator-5554   device
```

Si aparece `offline` o no aparece nada, espera unos segundos y vuelve a intentarlo.

### 1.5 Instalar la APK

```powershell
# Instalar la APK (primera vez)
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install "C:\ruta\a\ReciApp-release.apk"

# Si ya tienes una version anterior instalada, usa -r para reemplazar
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r "C:\ruta\a\ReciApp-release.apk"
```

Debe mostrar `Success`.

### 1.6 Lanzar la app

```powershell
# Lanzar directamente desde terminal
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell am start -n com.reciapp.mobile/.MainActivity
```

O simplemente busca "ReciApp" en el launcher del emulador y pulsa el icono.

### 1.7 Ver logs de depuracion (opcional)

```powershell
# Ver solo los logs de React Native JS
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" logcat -s ReactNativeJS:*

# Ver errores fatales
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" logcat *:E | Select-String "reciapp|ReactNative|FATAL"
```

### 1.8 Desinstalar la app

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" uninstall com.reciapp.mobile
```

---

## 2. Instalacion en un Dispositivo Fisico Android

### 2.1 Requisitos

- Un dispositivo Android con **Android 8.0 (API 26) o superior**
- Cable USB o conexion WiFi ADB
- **Depuracion USB** activada en el dispositivo

### 2.2 Activar la depuracion USB

1. Ve a **Ajustes > Acerca del telefono**
2. Pulsa 7 veces sobre **Numero de compilacion** para activar las opciones de desarrollador
3. Vuelve a **Ajustes > Sistema > Opciones de desarrollador**
4. Activa **Depuracion USB**
5. Conecta el dispositivo al PC por USB
6. En el telefono aparecera un dialogo pidiendo autorizar la depuracion: pulsa **Permitir**

### 2.3 Verificar conexion

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
```

Debe mostrar tu dispositivo como `device` (no como `unauthorized`):

```
List of devices attached
XXXXXXXXX    device
```

Si aparece `unauthorized`, revisa la pantalla del telefono — debe haber un dialogo de autorizacion pendiente.

### 2.4 Instalar la APK

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install "C:\ruta\a\ReciApp-release.apk"
```

### 2.5 Instalacion sin ADB (transferencia directa)

Si no quieres usar ADB:

1. Copia la APK al telefono (por USB, email, Google Drive, etc.)
2. En el telefono, abre un explorador de archivos y localiza la APK
3. Pulsa sobre ella para instalar
4. Si es la primera vez, Android pedira permiso para instalar desde origenes desconocidos:
   - Ve a **Ajustes > Seguridad > Origenes desconocidos** (o **Instalar apps desconocidas** en Android 8+)
   - Permite la instalacion desde la app que estas usando (explorador de archivos, Chrome, etc.)
5. Confirma la instalacion

### 2.6 Conexion WiFi ADB (sin cable)

Si prefieres instalar por WiFi:

```powershell
# 1. Conecta el dispositivo por USB primero
# 2. Activa ADB sobre TCP/IP
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" tcpip 5555

# 3. Averigua la IP del telefono (Ajustes > WiFi > tu red > IP)
# 4. Conecta por WiFi (desconecta el USB)
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" connect 192.168.X.X:5555

# 5. Instala la APK
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install "C:\ruta\a\ReciApp-release.apk"
```

---

## 3. Notas importantes

### Arquitectura de la APK

La APK actual incluye librerias nativas para **arm64-v8a** y **x86_64**:

| Arquitectura | Uso |
|-------------|-----|
| `arm64-v8a` | Dispositivos fisicos modernos (99%+ del mercado) |
| `x86_64` | Emuladores Android en PC (Intel/AMD) |

Si necesitas reducir el tamano de la APK para distribucion en dispositivos reales, puedes recompilar solo con `arm64-v8a` (ver GUIA_COMPILACION_APK.md).

### Trafico HTTP

La APK tiene habilitado `usesCleartextTraffic="true"` en el AndroidManifest porque el backend usa HTTP (sin TLS). Esto es necesario para que la app pueda conectar a `http://52.201.91.206:3000`. En un entorno de produccion se recomienda configurar HTTPS.

### Firma de la APK

La APK esta firmada con la clave de depuracion por defecto. Esto permite instalarla en cualquier dispositivo, pero:
- **No se puede publicar en Google Play** con esta firma
- Al actualizar, la nueva APK debe estar firmada con la misma clave
- Si cambias la clave, hay que desinstalar la version anterior primero

---

## 4. Solucion de problemas

| Problema | Causa | Solucion |
|----------|-------|----------|
| `INSTALL_FAILED_NO_MATCHING_ABIS` | La APK no incluye la arquitectura del dispositivo/emulador | Recompilar con la arquitectura correcta en `gradle.properties` |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | Version anterior firmada con otra clave | Desinstalar la version anterior: `adb uninstall com.reciapp.mobile` |
| App crashea al abrir | Librerias nativas incompatibles | Verificar con `adb logcat` y recompilar con la arquitectura correcta |
| "App no instalada" en el telefono | Origenes desconocidos desactivados | Activar en Ajustes > Seguridad > Instalar apps desconocidas |
| `Network request failed` al conectar | Trafico HTTP bloqueado o servidor apagado | Verificar que la API esta corriendo y que `usesCleartextTraffic="true"` esta en el manifest |
| `adb devices` muestra `unauthorized` | Falta autorizar la depuracion USB | Revisa la pantalla del telefono y acepta el dialogo |
