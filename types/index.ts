// Tipos que reflejan el esquema MySQL de reciInventario_db

export interface Usuario {
  id: number; // Id_Usuario
  nombre: string; // Nombre (unique)
  permisos: 'administrador' | 'cliente'; // Permisos
  emisionesReducidas: number; // Emisiones_Reducidas (kg CO2)
  tap: number | null; // TAP
}

export interface Producto {
  tipo: string; // Tipo (parte de PK compuesta)
  numeroBarras: string; // Numero_barras (parte de PK compuesta)
  nombre: string; // Nombre
  emisionesReducibles: number; // Emisiones_Reducibles (float, kg CO2)
  material: string; // Material
  imagen: string | null; // Imagen (URL o null)
}

export interface Recicla {
  idUsuario: number; // FK a Usuarios
  tipo: string; // FK a Productos.Tipo
  numeroBarras: string; // FK a Productos.Numero_barras
  fecha: string; // Date string YYYY-MM-DD
  hora: string; // Time string HH:mm:ss
}

export interface AuthResponse {
  token: string;
  user: Usuario;
}

// Producto extendido con el conteo de veces reciclado por el usuario
export interface ProductoConConteo extends Producto {
  vecesReciclado: number;
}

// Registro de historial con nombre del producto incluido
export interface HistorialItem extends Recicla {
  productoNombre: string;
  productoMaterial: string;
  emisionesReducibles: number;
}
