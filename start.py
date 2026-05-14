#!/usr/bin/env python3
"""
ReciApp - Script de arranque (ejecutar desde Windows)

Modos:
  python start.py              -> API en EC2 (solo verifica) + Expo (Windows)
  python start.py --local      -> API Spring Boot en WSL + Expo (Windows)
  python start.py --express    -> API Express en WSL + Expo (Windows)

Con --local / --express la API arranca en WSL para alcanzar MySQL en Docker LAMP.
Sin flags, asume que la API ya esta corriendo en EC2.
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

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
API_SPRING_DIR = os.path.join(SCRIPT_DIR, "api-spring")
API_EXPRESS_DIR = os.path.join(SCRIPT_DIR, "api")
APP_DIR     = SCRIPT_DIR

EC2_IP      = "52.201.91.206"
API_PORT    = 3000
MAX_WAIT    = 120
CHECK_INTERVAL = 2

GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"


def log(color, prefix, msg):
    print(f"{color}{BOLD}[{prefix}]{RESET} {msg}")


def check_api(host="localhost"):
    url = f"http://{host}:{API_PORT}/api/health"
    try:
        req  = urllib.request.Request(url, method="GET")
        resp = urllib.request.urlopen(req, timeout=3)
        return resp.status == 200
    except (urllib.error.URLError, OSError):
        return False


def get_wsl_path(windows_path):
    """C:\\Users\\foo\\bar -> /mnt/c/Users/foo/bar"""
    drive = windows_path[0].lower()
    rest  = windows_path[2:].replace("\\", "/")
    return f"/mnt/{drive}{rest}"


# ──────────────────────────────────────────────
# MODO EC2  (por defecto)
# ──────────────────────────────────────────────
def run_ec2_mode(processes, cleanup):
    log(CYAN, "EC2", f"Verificando que la API responde en {EC2_IP}:{API_PORT}...")

    elapsed = 0
    while elapsed < MAX_WAIT:
        if check_api(EC2_IP):
            log(GREEN, "EC2", f"API accesible -> http://{EC2_IP}:{API_PORT}/api/health")
            return True
        dots = "." * ((elapsed // CHECK_INTERVAL) % 4 + 1)
        print(f"  {YELLOW}Esperando{dots} ({elapsed}s/{MAX_WAIT}s){RESET}", end="\r")
        time.sleep(CHECK_INTERVAL)
        elapsed += CHECK_INTERVAL

    print()
    log(RED, "ERROR", f"La API en EC2 no responde tras {MAX_WAIT}s")
    log(YELLOW, "INFO", f"Comprueba que la API esta arrancada en la EC2:")
    log(YELLOW, "INFO", f"  ssh ubuntu@{EC2_IP}")
    log(YELLOW, "INFO", f"  nohup java -jar ~/api-spring/build/libs/reciapp-api-*.jar > ~/api.log 2>&1 &")
    log(YELLOW, "INFO", "Arrancando Expo igualmente (modo offline disponible en la app)...")
    return False


# ──────────────────────────────────────────────
# MODO LOCAL (--local / --express)
# ──────────────────────────────────────────────
def run_local_mode(use_express, processes, cleanup):
    if use_express:
        wsl_dir  = get_wsl_path(API_EXPRESS_DIR)
        api_name = "Express"
        wsl_cmd  = f"cd '{wsl_dir}' && npm install --silent && node index.js"
    else:
        wsl_dir  = get_wsl_path(API_SPRING_DIR)
        api_name = "Spring Boot"
        wsl_cmd  = f"cd '{wsl_dir}' && chmod +x gradlew && ./gradlew bootRun"

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

    def stream_api_output():
        for line in iter(api_proc.stdout.readline, b""):
            text = line.decode("utf-8", errors="replace").rstrip()
            if text:
                print(f"  {CYAN}|api|{RESET} {text}")

    threading.Thread(target=stream_api_output, daemon=True).start()

    log(YELLOW, "WAIT", f"Esperando a {api_name} en puerto {API_PORT}...")
    elapsed = 0
    while elapsed < MAX_WAIT:
        if api_proc.poll() is not None:
            log(RED, "ERROR", f"La API se cerro (exit code: {api_proc.returncode})")
            log(RED, "ERROR", "Posibles causas:")
            log(RED, "ERROR", "  - MySQL no esta corriendo (docker ps en WSL)")
            log(RED, "ERROR", "  - Puerto 3000 en uso")
            cleanup()
            return False

        if check_api("localhost"):
            log(GREEN, "API", f"API lista en {elapsed}s -> http://localhost:{API_PORT}/api/health")
            return True

        dots = "." * ((elapsed // CHECK_INTERVAL) % 4 + 1)
        print(f"  {YELLOW}Esperando{dots} ({elapsed}s/{MAX_WAIT}s){RESET}", end="\r")
        time.sleep(CHECK_INTERVAL)
        elapsed += CHECK_INTERVAL

    print()
    log(RED, "ERROR", f"La API no respondio tras {MAX_WAIT}s")
    log(RED, "ERROR", "Comprueba que MySQL esta corriendo: wsl -e bash -c 'docker ps'")
    cleanup()
    return False


# ──────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────
def main():
    use_express = "--express" in sys.argv or "-e" in sys.argv
    use_local   = "--local"   in sys.argv or "-l" in sys.argv or use_express
    is_windows  = platform.system() == "Windows"

    if not is_windows:
        log(RED, "ERROR", "Este script debe ejecutarse desde Windows (CMD o PowerShell).")
        log(RED, "ERROR", "WSL no puede abrir el emulador Android.")
        sys.exit(1)

    processes = []

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

    signal.signal(signal.SIGINT,  cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    # ── Modo segun flags ──
    if use_local:
        ok = run_local_mode(use_express, processes, cleanup)
    else:
        ok = run_ec2_mode(processes, cleanup)

    print()

    # ── Arrancar Expo ──
    log(CYAN, "EXPO", "Arrancando Expo en Windows (npx expo start)...")
    log(CYAN, "EXPO", "Pulsa 'a' para abrir el emulador Android")

    expo_proc = subprocess.Popen(
        ["npx", "expo", "start"],
        cwd=APP_DIR,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
        shell=True,
    )
    processes.append(("Expo", expo_proc))
    log(GREEN, "EXPO", f"Proceso iniciado (PID {expo_proc.pid})")

    print()
    log(GREEN, "OK", "=" * 55)
    log(GREEN, "OK", "  ReciApp arrancada!")
    if use_local:
        log(GREEN, "OK", f"  API (local): http://localhost:{API_PORT}/api/health")
    else:
        log(GREEN, "OK", f"  API (EC2):   http://{EC2_IP}:{API_PORT}/api/health")
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
