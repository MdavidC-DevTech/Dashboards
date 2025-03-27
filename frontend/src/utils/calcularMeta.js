// src/utils/calcularMeta.js
export function calcularMeta({ agrupacionModo, unidadTiempo, cursoSeleccionado, hayFiltros }) {
    if (!hayFiltros) {
      // Ejemplo: 240 minutos/mes o 4 horas/mes
      if (unidadTiempo === "minutos") {
        return 240; 
      } else {
        return 4;
      }
    }
  
    if (agrupacionModo === "mes") {
      if (cursoSeleccionado) {
        // 120 min/día * 30 días = 3600 min/mes, o 2 h/día * 30 = 60 h/mes
        if (unidadTiempo === "minutos") {
          return 3600;
        } else {
          return 60;
        }
      } else {
        if (unidadTiempo === "minutos") {
          return 240;
        } else {
          return 4;
        }
      }
    }
  
    if (agrupacionModo === "anio") {
      // Multiplicamos por 12
      if (unidadTiempo === "minutos") {
        return 240 * 12; // 2880 min/año
      } else {
        return 4 * 12;   // 48 h/año
      }
    }
  
    // Por defecto
    return 0;
  }
  