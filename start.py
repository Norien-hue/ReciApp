#!/usr/bin/env python3
"""
ReciApp - Script de arranque (ejecutar desde Windows)

  python start.py              -> API Spring Boot (WSL) + Expo (Windows)
  python start.py --express    -> API Express (WSL) + Expo (Windows)

La API se ejecuta en WSL para alcanzar MySQL en Docker LAMP.
Expo se ejecuta en Windows para que el emulador Android funcione.
"""

import subprocess
import sys
import os
import time
import signal
import urllib.request
import urllib.error
import platform
import threading

# Rutas relativas al script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
API_SPRING_DIR = os.path.join(SCRIPT_DIR, "api-spring")
API_EXPRESS_DIR = os.path.join(SCRIPT_DIR, "api")
APP_DIR = SCRIPT_DIR

API_PORT = 3000
API_URL = f"http://localhost:{API_PORT}/api/health"
MAX_WAIT = 120
CHECK_INTERVAL = 2

# Colores
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def log(color, prefix, msg):
    print(f"{color}{BOLD}[{prefix}]{RESET} {msg}")


def check_api():
    try:
        req = urllib.request.Request(API_URL, method="GET")
        resp = urllib.request.urlopen(req, timeout=3)
        return resp.status == 200
    except (urllib.error.URLError, OSError):
        return False


def get_wsl_path(windows_path):
    """C:\\Users\\foo\\bar -> /mnt/c/Users/foo/bar"""
    drive = windows_path[0].lower()
    rest = windows_path[2:].replace("\\", "/")
    return f"/mnt/{drive}{rest}"


def get_wsl_ip():
    """Obtiene la IP principal de WSL."""
    try:
        result = subprocess.run(
            ["wsl", "-e", "hostname", "-I"],
            capture_output=True, text=True, timeout=5
        )
        ip = result.stdout.strip().split()[0]
        return ip
    except Exception:
        return None


def update_api_client_ip(wsl_ip):
    """Actualiza WSL_IP en api.client.ts para que el emulador conecte."""
    api_client = os.path.join(SCRIPT_DIR, "services", "api.client.ts")
    try:
        with open(api_client, "r", encoding="utf-8") as f:
            content = f.read()
        import re
        new_content = re.sub(
            r"const WSL_IP = '[^']*'",
            f"const WSL_IP = '{wsl_ip}'",
            content
        )
        if new_content != content:
            with open(api_client, "w", encoding="utf-8") as f:
                f.write(new_content)
            return True
        return False
    except Exception:
        return False


def main():
    use_express = "--express" in sys.argv or "-e" in sys.argv
    is_windows = platform.system() == "Windows"
    processes = []

    if not is_windows:
        log(RED, "ERROR", "Este script debe ejecutarse desde Windows (CMD o PowerShell).")
        log(RED, "ERROR", "WSL no puede abrir el emulador Android.")
        log(YELLOW, "INFO", "Abre una terminal de Windows y ejecuta: python start.py")
        sys.exit(1)

    # Detectar IP de WSL y actualizar api.client.ts
    wsl_ip = get_wsl_ip()
    if wsl_ip:
        if update_api_client_ip(wsl_ip):
            log(GREEN, "WSL", f"IP de WSL actualizada en api.client.ts -> {wsl_ip}")
        else:
            log(CYAN, "WSL", f"IP de WSL ya correcta -> {wsl_ip}")
    else:
        log(YELLOW, "WSL", "No se pudo detectar la IP de WSL")

    def cleanup(sig=None, frame=None):
        log(YELLOW, "STOP", "Deteniendo procesos...")
        for name, proc in processes:
            if proc.poll() is None:
                log(YELLOW, "STOP", f"Terminando {name} (PID {proc.pid})")
                try:
                    proc.terminate()
                except (ProcessLookupError, OSError):
                    pass
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    # ========================================
    # 1. Arrancar API en WSL
    # ========================================
    if use_express:
        wsl_dir = get_wsl_path(API_EXPRESS_DIR)
        api_name = "Express"
        wsl_cmd = f"cd '{wsl_dir}' && npm install --silent && node index.js"
    else:
        wsl_dir = get_wsl_path(API_SPRING_DIR)
        api_name = "Spring Boot"
        wsl_cmd = f"cd '{wsl_dir}' && chmod +x gradlew && ./gradlew bootRun"

    log(CYAN, "API", f"Arrancando {api_name} en WSL -> {wsl_dir}")
    log(CYAN, "API", "(WSL conecta a MySQL/Docker LAMP en localhost:3306)")

    api_proc = subprocess.Popen(
        ["wsl", "-e", "bash", "-c", wsl_cmd],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
    )
    processes.append((f"API {api_name}", api_proc))
    log(GREEN, "API", f"Proceso WSL iniciado (PID {api_proc.pid})")

    # Stream API output en segundo plano
    def stream_api_output():
        for line in iter(api_proc.stdout.readline, b""):
            text = line.decode("utf-8", errors="replace").rstrip()
            if text:
                print(f"  {CYAN}|api|{RESET} {text}")

    api_thread = threading.Thread(target=stream_api_output, daemon=True)
    api_thread.start()

    # ========================================
    # 2. Esperar a que la API responda
    # ========================================
    log(YELLOW, "WAIT", f"Esperando a {api_name} en puerto {API_PORT}...")

    elapsed = 0
    while elapsed < MAX_WAIT:
        if api_proc.poll() is not None:
            log(RED, "ERROR", f"La API se cerro (exit code: {api_proc.returncode})")
            log(RED, "ERROR", "Revisa los logs de arriba. Posibles causas:")
            log(RED, "ERROR", "  - MySQL no esta corriendo en WSL/Docker")
            log(RED, "ERROR", "  - Puerto 3000 ya esta en uso")
            log(RED, "ERROR", "  - Faltan dependencias (npm install / gradlew)")
            cleanup()
            return

        if check_api():
            log(GREEN, "API", f"API lista en {elapsed}s -> {API_URL}")
            break

        dots = "." * ((elapsed // CHECK_INTERVAL) % 4 + 1)
        print(f"  {YELLOW}Esperando{dots} ({elapsed}s/{MAX_WAIT}s){RESET}", end="\r")
        time.sleep(CHECK_INTERVAL)
        elapsed += CHECK_INTERVAL
    else:
        log(RED, "ERROR", f"La API no respondio tras {MAX_WAIT}s")
        log(RED, "ERROR", "Comprueba que MySQL esta corriendo: wsl -e bash -c 'docker ps'")
        cleanup()
        return

    print()

    # ========================================
    # 3. Arrancar Expo en Windows (para emulador Android)
    # ========================================
    log(CYAN, "EXPO", "Arrancando Expo en Windows (npx expo start)...")
    log(CYAN, "EXPO", "Pulsa 'a' para abrir el emulador Android")

    expo_proc = subprocess.Popen(
        ["npx", "expo", "start"],
        cwd=APP_DIR,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
        shell=True,
    )
    processes.append(("Expo", expo_proc))
    log(GREEN, "EXPO", f"Proceso Windows iniciado (PID {expo_proc.pid})")

    print()
    log(GREEN, "OK", "=" * 55)
    log(GREEN, "OK", "  ReciApp arrancada correctamente!")
    log(GREEN, "OK", f"  API ({api_name}): http://localhost:{API_PORT}/api/health")
    log(GREEN, "OK", "  Expo: pulsa 'a' para emulador Android")
    log(GREEN, "OK", "  Ctrl+C para detener todo")
    log(GREEN, "OK", "=" * 55)
    print()

    try:
        expo_proc.wait()
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()


if __name__ == "__main__":
    main()
