#!/usr/bin/env python3
"""
CLI para gestionar imagenes de productos en ReciApp.

Funciones:
  - Listar todos los productos con su info (indica si tiene imagen o no)
  - Seleccionar un producto y subir una imagen (se convierte a base64)

Requisitos:
  pip install mysql-connector-python
"""

import base64
import os
import sys
import mimetypes

try:
    import mysql.connector
except ImportError:
    print("Error: necesitas instalar mysql-connector-python")
    print("  pip install mysql-connector-python")
    sys.exit(1)

# Configuracion de la base de datos
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "clase1234",
    "database": "reciInventario_db",
}


def conectar():
    """Conecta a la base de datos y devuelve conexion + cursor."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as e:
        print(f"\nError al conectar a MySQL: {e}")
        print(f"Verifica que MySQL esta corriendo en {DB_CONFIG['host']}:{DB_CONFIG['port']}")
        sys.exit(1)


def listar_productos(conn):
    """Lista todos los productos con su informacion."""
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT Tipo, Numero_barras, Nombre, Emisiones_Reducibles, Material, "
        "CASE WHEN Imagen IS NOT NULL AND Imagen != '' THEN 'Si' ELSE 'No' END AS tiene_imagen "
        "FROM Productos ORDER BY Nombre"
    )
    productos = cursor.fetchall()
    cursor.close()

    if not productos:
        print("\nNo hay productos en la base de datos.")
        return []

    # Cabecera
    print("\n" + "=" * 90)
    print(f"{'#':<4} {'Nombre':<30} {'Material':<12} {'Codigo':<16} {'CO2 (kg)':<10} {'Imagen'}")
    print("=" * 90)

    for i, p in enumerate(productos, 1):
        nombre = (p["Nombre"] or "Sin nombre")[:28]
        material = (p["Material"] or "-")[:10]
        barras = str(p["Numero_barras"])
        emisiones = f"{p['Emisiones_Reducibles']:.1f}" if p["Emisiones_Reducibles"] else "0.0"
        imagen = p["tiene_imagen"]
        print(f"{i:<4} {nombre:<30} {material:<12} {barras:<16} {emisiones:<10} {imagen}")

    print("=" * 90)
    print(f"Total: {len(productos)} productos\n")

    return productos


def seleccionar_producto(productos):
    """Pide al usuario que seleccione un producto por numero."""
    while True:
        entrada = input("Selecciona un producto (numero) o 'q' para salir: ").strip()
        if entrada.lower() == "q":
            return None
        try:
            idx = int(entrada)
            if 1 <= idx <= len(productos):
                return productos[idx - 1]
            print(f"Numero fuera de rango. Introduce un numero entre 1 y {len(productos)}.")
        except ValueError:
            print("Introduce un numero valido.")


def subir_imagen(conn, producto):
    """Pide la ruta de una imagen, la convierte a base64 y la sube."""
    nombre = producto["Nombre"]
    tipo = producto["Tipo"]
    barras = producto["Numero_barras"]

    print(f"\nProducto seleccionado: {nombre} ({tipo} / {barras})")

    while True:
        ruta = input("Ruta de la imagen (o 'q' para cancelar): ").strip()

        # Quitar comillas si las puso
        ruta = ruta.strip("\"'")

        if ruta.lower() == "q":
            return

        if not os.path.isfile(ruta):
            print(f"El archivo no existe: {ruta}")
            continue

        # Detectar tipo MIME
        mime, _ = mimetypes.guess_type(ruta)
        if not mime or not mime.startswith("image/"):
            print(f"El archivo no parece ser una imagen (tipo detectado: {mime})")
            continuar = input("Continuar de todas formas? (s/n): ").strip().lower()
            if continuar != "s":
                continue

        # Leer y convertir a base64
        try:
            with open(ruta, "rb") as f:
                datos = f.read()

            tamano_mb = len(datos) / (1024 * 1024)
            print(f"Tamano del archivo: {tamano_mb:.2f} MB")

            if tamano_mb > 16:
                print("Advertencia: la imagen es muy grande (>16MB). Puede causar problemas.")
                continuar = input("Continuar? (s/n): ").strip().lower()
                if continuar != "s":
                    continue

            # Codificar a base64 con prefijo data URI
            b64 = base64.b64encode(datos).decode("utf-8")
            if mime:
                data_uri = f"data:{mime};base64,{b64}"
            else:
                data_uri = f"data:image/png;base64,{b64}"

            # Subir a la base de datos
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE Productos SET Imagen = %s WHERE Tipo = %s AND Numero_barras = %s",
                (data_uri, tipo, barras),
            )
            conn.commit()
            cursor.close()

            print(f"Imagen subida correctamente para '{nombre}'")
            print(f"Base64 guardado: {len(data_uri)} caracteres")
            return

        except Exception as e:
            print(f"Error al procesar la imagen: {e}")


def eliminar_imagen(conn, producto):
    """Elimina la imagen de un producto."""
    nombre = producto["Nombre"]
    confirmar = input(f"Eliminar imagen de '{nombre}'? (s/n): ").strip().lower()
    if confirmar != "s":
        print("Cancelado.")
        return

    cursor = conn.cursor()
    cursor.execute(
        "UPDATE Productos SET Imagen = NULL WHERE Tipo = %s AND Numero_barras = %s",
        (producto["Tipo"], producto["Numero_barras"]),
    )
    conn.commit()
    cursor.close()
    print(f"Imagen eliminada de '{nombre}'.")


def menu_producto(conn, producto):
    """Menu de acciones para un producto seleccionado."""
    while True:
        nombre = producto["Nombre"]
        print(f"\n--- {nombre} ---")
        print("1. Subir/reemplazar imagen")
        print("2. Eliminar imagen")
        print("3. Volver")

        opcion = input("Opcion: ").strip()
        if opcion == "1":
            subir_imagen(conn, producto)
        elif opcion == "2":
            eliminar_imagen(conn, producto)
        elif opcion == "3":
            break
        else:
            print("Opcion no valida.")


def main():
    print("=" * 50)
    print("  ReciApp - Gestor de Imagenes de Productos")
    print("=" * 50)

    conn = conectar()
    print(f"Conectado a MySQL ({DB_CONFIG['host']}:{DB_CONFIG['port']})")

    try:
        while True:
            productos = listar_productos(conn)
            if not productos:
                break

            producto = seleccionar_producto(productos)
            if producto is None:
                break

            menu_producto(conn, producto)

    except KeyboardInterrupt:
        print("\n\nSaliendo...")
    finally:
        conn.close()
        print("Conexion cerrada. Hasta luego!")


if __name__ == "__main__":
    main()
