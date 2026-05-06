#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════╗
║              RECIAPP — Terminal de Reciclaje                 ║
║                                                              ║
║  Programa de terminal para registrar reciclajes usando       ║
║  un lector de códigos de barras y el TAP del usuario.        ║
║                                                              ║
║  Conecta con la API REST de ReciApp (Express + MySQL).       ║
╚══════════════════════════════════════════════════════════════╝

Uso:
    python reciclaje_terminal.py [--api URL_BASE]

Requisitos:
    pip install requests
"""

import sys
import os
import time
import requests
from datetime import datetime

# ══════════════════════════════════════════════════════════════
# Configuración
# ══════════════════════════════════════════════════════════════

API_BASE = os.environ.get("RECIAPP_API_URL", "http://52.201.91.206:3000")

# Credenciales del usuario administrador que opera el terminal
# Se pueden configurar vía variables de entorno
ADMIN_NOMBRE = os.environ.get("RECIAPP_ADMIN_USER", "admin")
ADMIN_PASSWORD = os.environ.get("RECIAPP_ADMIN_PASS", "admin")

# ══════════════════════════════════════════════════════════════
# Colores para la terminal
# ══════════════════════════════════════════════════════════════

class Color:
    VERDE = "\033[92m"
    ROJO = "\033[91m"
    AMARILLO = "\033[93m"
    AZUL = "\033[94m"
    CIAN = "\033[96m"
    BLANCO = "\033[97m"
    GRIS = "\033[90m"
    NEGRITA = "\033[1m"
    RESET = "\033[0m"

def verde(texto):
    return f"{Color.VERDE}{texto}{Color.RESET}"

def rojo(texto):
    return f"{Color.ROJO}{texto}{Color.RESET}"

def amarillo(texto):
    return f"{Color.AMARILLO}{texto}{Color.RESET}"

def azul(texto):
    return f"{Color.AZUL}{texto}{Color.RESET}"

def cian(texto):
    return f"{Color.CIAN}{texto}{Color.RESET}"

def negrita(texto):
    return f"{Color.NEGRITA}{texto}{Color.RESET}"

# ══════════════════════════════════════════════════════════════
# Clase principal
# ══════════════════════════════════════════════════════════════

class ReciAppTerminal:
    def __init__(self, api_base: str):
        self.api_base = api_base.rstrip("/")
        self.token = None
        self.session = requests.Session()

    # ──────────────────────────────────────────────────────────
    # Helpers HTTP
    # ──────────────────────────────────────────────────────────
    def _headers(self):
        h = {"Content-Type": "application/json"}
        if self.token:
            h["Authorization"] = f"Bearer {self.token}"
        return h

    def _get(self, path: str, params=None):
        url = f"{self.api_base}{path}"
        resp = self.session.get(url, headers=self._headers(), params=params, timeout=10)
        return resp

    def _post(self, path: str, data: dict):
        url = f"{self.api_base}{path}"
        resp = self.session.post(url, headers=self._headers(), json=data, timeout=10)
        return resp

    # ──────────────────────────────────────────────────────────
    # 1. Conexión y autenticación
    # ──────────────────────────────────────────────────────────
    def check_conexion(self) -> bool:
        """Verifica que la API esté disponible."""
        try:
            resp = self._get("/api/health")
            data = resp.json()
            return data.get("status") == "ok"
        except Exception:
            return False

    def login(self, nombre: str, password: str) -> bool:
        """Inicia sesión y guarda el token JWT."""
        try:
            resp = self._post("/api/usuarios/login", {
                "nombre": nombre,
                "password": password,
            })
            if resp.status_code == 200:
                data = resp.json()
                self.token = data.get("token")
                return self.token is not None
            return False
        except Exception as e:
            print(rojo(f"  Error de conexión al login: {e}"))
            return False

    # ──────────────────────────────────────────────────────────
    # 2. Buscar producto por código de barras
    # ──────────────────────────────────────────────────────────
    def buscar_producto(self, codigo_barras: str) -> dict | None:
        """Busca un producto por su número de barras."""
        try:
            resp = self._get(f"/api/productos/barcode/{codigo_barras}")
            if resp.status_code == 200:
                return resp.json()
            elif resp.status_code == 404:
                return None
            else:
                print(rojo(f"  Error buscando producto: HTTP {resp.status_code}"))
                return None
        except Exception as e:
            print(rojo(f"  Error de conexión: {e}"))
            return None

    # ──────────────────────────────────────────────────────────
    # 3. Buscar usuario por TAP
    # ──────────────────────────────────────────────────────────
    def buscar_usuario_por_tap(self, tap: str) -> dict | None:
        """Busca un usuario por su TAP (Token de Autenticación Personal)."""
        try:
            resp = self._get(f"/api/usuarios/by-tap/{tap}")
            if resp.status_code == 200:
                return resp.json()
            elif resp.status_code == 404:
                return None
            else:
                print(rojo(f"  Error buscando usuario: HTTP {resp.status_code}"))
                return None
        except Exception as e:
            print(rojo(f"  Error de conexión: {e}"))
            return None

    # ──────────────────────────────────────────────────────────
    # 4. Registrar reciclaje
    # ──────────────────────────────────────────────────────────
    def registrar_reciclaje(self, id_usuario: int, tipo: str, numero_barras: str) -> dict | None:
        """Registra un reciclaje y devuelve la respuesta con emisiones acumuladas."""
        try:
            resp = self._post("/api/historial", {
                "idUsuario": id_usuario,
                "tipo": tipo,
                "numeroBarras": numero_barras,
            })
            if resp.status_code == 201:
                return resp.json()
            else:
                data = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
                print(rojo(f"  Error registrando reciclaje: {data.get('error', f'HTTP {resp.status_code}')}"))
                return None
        except Exception as e:
            print(rojo(f"  Error de conexión: {e}"))
            return None


# ══════════════════════════════════════════════════════════════
# Interfaz de terminal
# ══════════════════════════════════════════════════════════════

def limpiar_pantalla():
    os.system("cls" if os.name == "nt" else "clear")

def mostrar_banner():
    print()
    print(verde("  ╔══════════════════════════════════════════════════════════╗"))
    print(verde("  ║") + negrita("        ♻  RECIAPP — Terminal de Reciclaje  ♻         ") + verde("║"))
    print(verde("  ╚══════════════════════════════════════════════════════════╝"))
    print()

def mostrar_separador():
    print(f"  {Color.GRIS}{'─' * 56}{Color.RESET}")

def mostrar_producto(producto: dict):
    """Muestra los detalles de un producto encontrado."""
    print()
    print(verde("  ✓ Producto encontrado:"))
    mostrar_separador()
    print(f"  {negrita('Nombre:')}     {cian(producto['nombre'])}")
    print(f"  {negrita('Material:')}   {producto['material']}")
    print(f"  {negrita('Tipo:')}       {producto['tipo']}")
    print(f"  {negrita('Barras:')}     {producto['numeroBarras']}")
    print(f"  {negrita('CO₂ red.:')}   {verde(str(producto['emisionesReducibles']) + ' kg')}")
    mostrar_separador()

def mostrar_usuario(usuario: dict):
    """Muestra los detalles del usuario encontrado."""
    print()
    print(verde("  ✓ Usuario verificado:"))
    mostrar_separador()
    print(f"  {negrita('Nombre:')}     {cian(usuario['nombre'])}")
    print(f"  {negrita('TAP:')}        {usuario['tap']}")
    print(f"  {negrita('CO₂ acum.:')} {verde(str(usuario['emisionesReducidas']) + ' kg')}")
    mostrar_separador()

def mostrar_confirmacion(resultado: dict):
    """Muestra la confirmación del reciclaje registrado."""
    reciclaje = resultado["reciclaje"]
    emisiones_acumuladas = resultado["emisionesAcumuladas"]

    print()
    print(verde("  ╔══════════════════════════════════════════════════════════╗"))
    print(verde("  ║") + negrita("            ✅  RECICLAJE REGISTRADO  ✅                ") + verde("║"))
    print(verde("  ╚══════════════════════════════════════════════════════════╝"))
    print()
    print(f"  {negrita('Producto:')}       {cian(reciclaje['productoNombre'])}")
    print(f"  {negrita('Material:')}       {reciclaje['productoMaterial']}")
    print(f"  {negrita('CO₂ reducido:')}   {verde(str(reciclaje['emisionesReducibles']) + ' kg')}")
    print()
    print(f"  {negrita('Fecha:')}          {reciclaje['fecha']}")
    print(f"  {negrita('Hora:')}           {reciclaje['hora']}")
    print()
    mostrar_separador()
    print()
    print(f"  {Color.NEGRITA}{Color.VERDE}  🌍 Emisiones reducidas acumuladas: {emisiones_acumuladas} kg CO₂  {Color.RESET}")
    print()
    mostrar_separador()
    print()


def main():
    # Parsear argumentos
    api_url = API_BASE
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--api" and i + 1 < len(args):
            api_url = args[i + 1]
            i += 2
        else:
            i += 1

    terminal = ReciAppTerminal(api_url)

    limpiar_pantalla()
    mostrar_banner()

    # ── Paso 0: Verificar conexión con la API ──
    print(f"  {Color.GRIS}Conectando con la API en {api_url}...{Color.RESET}")
    if not terminal.check_conexion():
        print(rojo("\n  ✗ No se pudo conectar con la API."))
        print(rojo(f"    Asegúrate de que el servidor esté corriendo en {api_url}"))
        print(rojo("    Ejecuta: node api/index.js"))
        sys.exit(1)
    print(verde("  ✓ Conexión con la API establecida."))
    print()

    # ── Paso 1: Login del operador del terminal ──
    print(f"  {Color.GRIS}Autenticando terminal...{Color.RESET}")

    # Intentar login con credenciales configuradas
    if not terminal.login(ADMIN_NOMBRE, ADMIN_PASSWORD):
        print(amarillo("  ⚠ No se pudo autenticar con las credenciales por defecto."))
        print(amarillo("    Ingresa las credenciales del operador del terminal:\n"))
        intentos = 3
        while intentos > 0:
            nombre = input(f"  {negrita('Usuario:')} ").strip()
            password = input(f"  {negrita('Contraseña:')} ").strip()
            if terminal.login(nombre, password):
                break
            intentos -= 1
            if intentos > 0:
                print(rojo(f"  ✗ Credenciales incorrectas. {intentos} intento(s) restante(s).\n"))
            else:
                print(rojo("\n  ✗ Demasiados intentos fallidos. Saliendo."))
                sys.exit(1)

    print(verde("  ✓ Terminal autenticado correctamente."))
    print()
    mostrar_separador()

    # ── Bucle principal ──
    while True:
        print()
        print(negrita("  ═══ NUEVO RECICLAJE ═══"))
        print()
        print(f"  {amarillo('Paso 1/3:')} Escanea el código de barras del producto")
        print(f"  {Color.GRIS}(escribe 'salir' para terminar){Color.RESET}")
        print()

        # ── Paso 2: Escanear código de barras ──
        codigo_barras = input(f"  {negrita('📦 Código de barras:')} ").strip()

        if codigo_barras.lower() in ("salir", "exit", "quit", "q"):
            print()
            print(verde("  ¡Hasta pronto! Gracias por reciclar. ♻"))
            print()
            break

        if not codigo_barras:
            print(rojo("  ✗ Código de barras vacío. Inténtalo de nuevo."))
            continue

        # Buscar producto
        print(f"\n  {Color.GRIS}Buscando producto...{Color.RESET}")
        producto = terminal.buscar_producto(codigo_barras)

        if producto is None:
            print(rojo("  ✗ Producto no encontrado en la base de datos."))
            print(rojo(f"    Código escaneado: {codigo_barras}"))
            print(amarillo("    Verifica que el producto esté registrado en el sistema.\n"))
            continue

        mostrar_producto(producto)

        # ── Paso 3: Pedir TAP del usuario ──
        print(f"  {amarillo('Paso 2/3:')} Introduce el TAP del usuario")
        print()
        tap_input = input(f"  {negrita('🔑 TAP del usuario:')} ").strip()

        if tap_input.lower() in ("salir", "exit", "quit", "q"):
            print()
            print(verde("  ¡Hasta pronto! Gracias por reciclar. ♻"))
            print()
            break

        if not tap_input:
            print(rojo("  ✗ TAP vacío. Operación cancelada.\n"))
            continue

        # Verificar TAP
        print(f"\n  {Color.GRIS}Verificando TAP...{Color.RESET}")
        usuario = terminal.buscar_usuario_por_tap(tap_input)

        if usuario is None:
            print(rojo("  ✗ No se encontró ningún usuario con ese TAP."))
            print(rojo(f"    TAP introducido: {tap_input}"))
            print(amarillo("    Verifica que el TAP sea correcto.\n"))
            continue

        mostrar_usuario(usuario)

        # ── Paso 4: Confirmar y registrar ──
        print(f"  {amarillo('Paso 3/3:')} Confirmar reciclaje")
        print()
        print(f"  {negrita('Resumen:')}")
        print(f"    Producto:  {cian(producto['nombre'])} ({producto['material']})")
        print(f"    Usuario:   {cian(usuario['nombre'])}")
        print(f"    CO₂ red.:  {verde(str(producto['emisionesReducibles']) + ' kg')}")
        print()

        confirmacion = input(f"  {negrita('¿Registrar reciclaje? (S/n):')} ").strip().lower()

        if confirmacion in ("n", "no"):
            print(amarillo("\n  ⚠ Reciclaje cancelado.\n"))
            continue

        # Registrar
        print(f"\n  {Color.GRIS}Registrando reciclaje...{Color.RESET}")
        resultado = terminal.registrar_reciclaje(
            id_usuario=usuario["id"],
            tipo=producto["tipo"],
            numero_barras=producto["numeroBarras"],
        )

        if resultado is None:
            print(rojo("  ✗ Error al registrar el reciclaje. Inténtalo de nuevo.\n"))
            continue

        mostrar_confirmacion(resultado)

        # Pausa antes del siguiente escaneo
        print(f"  {Color.GRIS}Listo para el siguiente escaneo...{Color.RESET}")
        time.sleep(2)


if __name__ == "__main__":
    main()
