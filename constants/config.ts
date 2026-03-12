// ============================================================
// constants/config.ts
// ============================================================
// Configuración de la conexión a la base de datos y constantes
// IMPORTANTE: En producción, esto debería estar en un backend/API.
// La conexión directa a MySQL desde una app móvil NO es segura.
// Aquí se usa con fines de desarrollo/demostración.
// ============================================================

export const DB_CONFIG = {
  host: "TU_IP_O_HOST", // Cambia esto a la IP de tu servidor MySQL
  port: 3306,
  user: "root", // Cambia al usuario de tu BD
  password: "", // Cambia a la contraseña de tu BD
  database: "reciInventario_db",
};

export const JWT_SECRET = "reciapp_secret_key_change_in_production";

export const MATERIAL_COLORS: Record<string, string> = {
  PET: "#3B82F6",
  Vidrio: "#10B981",
  Aluminio: "#F59E0B",
  Plástico: "#EF4444",
  Brick: "#8B5CF6",
};

export const MATERIAL_ICONS: Record<string, string> = {
  PET: "bottle-water",
  Vidrio: "glass-fragile",
  Aluminio: "can",
  Plástico: "recycle",
  Brick: "package-variant-closed",
};

export const CONTENEDOR_MAP: Record<string, { nombre: string; color: string }> = {
  PET: { nombre: "Amarillo", color: "#FBBF24" },
  Vidrio: { nombre: "Verde", color: "#34D399" },
  Aluminio: { nombre: "Amarillo", color: "#FBBF24" },
  Plástico: { nombre: "Amarillo", color: "#FBBF24" },
  Brick: { nombre: "Amarillo", color: "#FBBF24" },
};
