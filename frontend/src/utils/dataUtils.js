// src/utils/dataUtils.js

// Retorna un array único de cursos, filtrando según un docente (si se indica)
export function obtenerCursosFiltrados(data, docenteSeleccionado) {
  if (docenteSeleccionado) {
    const cursos = new Set(
      data.filter(d => d.Combinada === docenteSeleccionado).map(d => d.course_fullname)
    );
    return Array.from(cursos);
  } else {
    return Array.from(new Set(data.map(d => d.course_fullname)));
  }
}

// Retorna un array único de docentes, filtrando según un curso (si se indica)
export function obtenerDocentesFiltrados(data, cursoSeleccionado) {
  if (cursoSeleccionado) {
    const docentes = new Set(
      data.filter(d => d.course_fullname === cursoSeleccionado).map(d => d.Combinada)
    );
    return Array.from(docentes);
  } else {
    return Array.from(new Set(data.map(d => d.Combinada)));
  }
}

// Retorna un array único de cursos sin filtrar (útil en algunas páginas)
export function obtenerCursosSinDocente(data) {
  return Array.from(new Set(data.map(d => d.course_fullname)));
}

// Función para extraer el nombre del mes (en español) de una fecha
function extraerMes(fechaString) {
  const fecha = new Date(fechaString);
  return fecha.toLocaleString("es-ES", { month: "long" }).toLowerCase(); // ej: "enero"
}

// Agrupa la data por mes, filtrando opcionalmente por año, y suma la métrica (minutos_activo u horas_activo)
export function agruparDataPorMes(data, yearSeleccionado, unidadTiempo = "minutos") {
  const map = {};
  data.forEach(item => {
    if (!item.event_date) return;
    const fecha = new Date(item.event_date);
    const anio = fecha.getFullYear().toString();
    if (yearSeleccionado && anio !== yearSeleccionado) return;
    const mes = extraerMes(item.event_date); // ej: "enero"
    const valor = unidadTiempo === "minutos" ? Math.round(item.minutos_activo) : Math.round(item.horas_activo);
    if (!map[mes]) {
      map[mes] = { mes, total: 0 };
    }
    map[mes].total += valor;
  });
  const ordenMeses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return Object.values(map).sort((a, b) => ordenMeses.indexOf(a.mes) - ordenMeses.indexOf(b.mes));
}

// Agrupa la data por año y suma la métrica (minutos_activo u horas_activo)
export function agruparDataPorAnio(data, yearSeleccionado, unidadTiempo = "minutos") {
  const map = {};
  data.forEach(item => {
    if (!item.event_date) return;
    const fecha = new Date(item.event_date);
    const anio = fecha.getFullYear().toString();
    if (yearSeleccionado && anio !== yearSeleccionado) return;
    const valor = unidadTiempo === "minutos" ? Math.round(item.minutos_activo) : Math.round(item.horas_activo);
    if (!map[anio]) {
      map[anio] = { mes: anio, total: 0 };
    }
    map[anio].total += valor;
  });
  return Object.values(map).sort((a, b) => a.mes.localeCompare(b.mes));
}

// Agrupa la data de estudiantes por rangos de actividad y por mes, filtrando opcionalmente por año.
export function agruparEstudiantesPorRango(data, yearSeleccionado, agrupacion = "mes") {
  const map = {};
  data.forEach(item => {
    if (!item.event_date) return;
    const fecha = new Date(item.event_date);
    const anio = fecha.getFullYear().toString();
    if (yearSeleccionado && anio !== yearSeleccionado) return;
    const mes = extraerMes(item.event_date);
    const rango = item.recuento_activo; // ej: "Sin minutos", "1 a 10 minutos", etc.
    if (!map[mes]) {
      map[mes] = {
        mes,
        "Sin minutos": 0,
        "1 a 10 minutos": 0,
        "10 a 40 minutos": 0,
        "más de 40 minutos": 0,
      };
    }
    map[mes][rango] = (map[mes][rango] || 0) + 1;
  });
  const ordenMeses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return Object.values(map).sort((a, b) => ordenMeses.indexOf(a.mes) - ordenMeses.indexOf(b.mes));
}

// Agrupa la data para conteo de acceso por rangos y por mes, filtrando opcionalmente por año.
export function agruparAccesoPorRango(data, yearSeleccionado) {
  const map = {};
  data.forEach(item => {
    if (!item.event_date) return;
    const fecha = new Date(item.event_date);
    const anio = fecha.getFullYear().toString();
    if (yearSeleccionado && anio !== yearSeleccionado) return;
    const mes = extraerMes(item.event_date);
    const rango = item.recuento_activo; // ej: "Sin minutos", etc.
    if (!map[mes]) {
      map[mes] = {
        mes,
        "Sin minutos": 0,
        "1 a 10 minutos": 0,
        "10 a 40 minutos": 0,
        "más de 40 minutos": 0,
      };
    }
    map[mes][rango] = (map[mes][rango] || 0) + 1;
  });
  const ordenMeses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return Object.values(map).sort((a, b) => ordenMeses.indexOf(a.mes) - ordenMeses.indexOf(b.mes));
}
