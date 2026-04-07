-- Crear base de datos y tablas para ReciApp
-- Ejecutar con: sudo mysql < 000_create_database.sql

CREATE DATABASE IF NOT EXISTS `reciInventario_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `reciInventario_db`;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS `Usuarios` (
  `Id_Usuario` INT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(50) NOT NULL,
  `Hash_Contraseña` VARCHAR(100) NOT NULL,
  `Permisos` VARCHAR(15) DEFAULT 'cliente',
  `Emisiones_Reducidas` FLOAT DEFAULT 0,
  `TAP` INT DEFAULT NULL,
  PRIMARY KEY (`Id_Usuario`),
  UNIQUE KEY `uk_nombre` (`Nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de productos
CREATE TABLE IF NOT EXISTS `Productos` (
  `Tipo` VARCHAR(10) NOT NULL,
  `Numero_barras` BIGINT NOT NULL,
  `Nombre` VARCHAR(50) DEFAULT NULL,
  `Emisiones_Reducibles` FLOAT DEFAULT NULL,
  `Material` VARCHAR(15) DEFAULT NULL,
  `Imagen` LONGTEXT DEFAULT NULL,
  PRIMARY KEY (`Tipo`, `Numero_barras`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de reciclaje (historial)
CREATE TABLE IF NOT EXISTS `Recicla` (
  `Id_Usuario` INT NOT NULL,
  `Tipo` VARCHAR(10) NOT NULL,
  `Numero_barras` BIGINT NOT NULL,
  `Fecha` DATE NOT NULL,
  `Hora` TIME NOT NULL,
  PRIMARY KEY (`Id_Usuario`, `Tipo`, `Numero_barras`, `Fecha`, `Hora`),
  CONSTRAINT `fk_recicla_usuario`
    FOREIGN KEY (`Id_Usuario`) REFERENCES `Usuarios` (`Id_Usuario`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_recicla_producto`
    FOREIGN KEY (`Tipo`, `Numero_barras`) REFERENCES `Productos` (`Tipo`, `Numero_barras`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Datos de ejemplo para poder probar
INSERT IGNORE INTO `Productos` (`Tipo`, `Numero_barras`, `Nombre`, `Emisiones_Reducibles`, `Material`, `Imagen`) VALUES
  ('EAN13', 8410076472885, 'Coca-Cola 330ml', 0.033, 'Aluminio', NULL),
  ('EAN13', 8411700000017, 'Agua Bezoya 1.5L', 0.025, 'PET', NULL),
  ('EAN13', 8480000291455, 'Leche Hacendado 1L', 0.040, 'Brick', NULL),
  ('EAN13', 8410128800505, 'Mahou Clasica 330ml', 0.045, 'Vidrio', NULL),
  ('EAN13', 5449000000996, 'Fanta Naranja 330ml', 0.033, 'Aluminio', NULL);
