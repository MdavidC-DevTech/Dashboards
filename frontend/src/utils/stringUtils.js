// src/utils/stringUtils.js
export function limpiarNombreColegio(nombre) {
    // Elimina 4 dígitos al inicio seguidos de espacios (por ejemplo, "2024 ")
    return nombre.replace(/^\d{4}\s*/, '');
  }
  