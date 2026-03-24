-- Migracion: cambiar columna Imagen de TEXT a LONGTEXT para soportar base64
-- Ejecutar en la base de datos reciInventario_db

USE reciInventario_db;

ALTER TABLE `Productos`
  MODIFY `Imagen` LONGTEXT DEFAULT NULL;
