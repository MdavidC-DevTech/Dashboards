// src/utils/dataUtils.js

function extraerMes(fechaString) {
  const fecha = new Date(fechaString);
  return fecha.toLocaleString("es-ES", { month: "long" }).toLowerCase();
}

export function agruparDataPorMes(data, yearSeleccionado, unidadTiempo = "minutos") {
  const map = {};
  data.forEach(item => {
    if (!item.event_date) return;
    const fecha = new Date(item.event_date);
    const anio = fecha.getFullYear().toString();
    if (yearSeleccionado && anio !== yearSeleccionado) return;
    const mes = extraerMes(item.event_date);
    const valor = unidadTiempo === "minutos"
      ? Math.round(item.active_seconds / 60)
      : Math.round(item.active_seconds / 3600);
    if (!map[mes]) {
      map[mes] = { mes, total: 0 };
    }
    map[mes].total += valor;
  });
  const ordenMeses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return Object.values(map).sort((a, b) => ordenMeses.indexOf(a.mes) - ordenMeses.indexOf(b.mes));
}

export function agruparDataPorAnio(data, yearSeleccionado, unidadTiempo = "minutos") {
  const map = {};
  data.forEach((item) => {
    if (!item.event_date) return;
    const fecha = new Date(item.event_date);
    const anio = fecha.getFullYear().toString();
    if (yearSeleccionado && anio !== yearSeleccionado) return;
    const valor = unidadTiempo === "minutos"
      ? Math.round(item.active_seconds / 60)
      : Math.round(item.active_seconds / 3600);
    if (!map[anio]) {
      map[anio] = { mes: anio, total: 0 };
    }
    map[anio].total += valor;
  });
  return Object.values(map).sort((a, b) => a.mes.localeCompare(b.mes));
}

export function agruparAccesoPorRango(data, yearSeleccionado) {
  const map = {};
  data.forEach((item) => {
    if (!item.event_date) return;
    const fecha = new Date(item.event_date);
    const anio = fecha.getFullYear().toString();
    if (yearSeleccionado && anio !== yearSeleccionado) return;
    const mes = extraerMes(item.event_date);
    // Convertir active_seconds a minutos
    const minutos = item.active_seconds / 60;
    let rango = "";
    if (minutos === 0) {
      rango = "Sin minutos";
    } else if (minutos > 0 && minutos <= 10) {
      rango = "1 a 10 minutos";
    } else if (minutos > 10 && minutos <= 40) {
      rango = "10 a 40 minutos";
    } else if (minutos > 40) {
      rango = "más de 40 minutos";
    }
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

// Funciones para docentes y cursos se mantienen según lo ajustado:
export function obtenerCursosFiltrados(data, docenteSeleccionado) {
  if (docenteSeleccionado) {
    const cursos = new Set(
      data.filter((d) => {
        // Usamos el mismo método para combinar nombres de docentes
        return `${d.user_fname} ${d.user_sname}` === docenteSeleccionado;
      }).map((d) => d.course_fullname)
    );
    return Array.from(cursos);
  } else {
    return Array.from(new Set(data.map((d) => d.course_fullname)));
  }
}

export function obtenerDocentesFiltrados(data, cursoSeleccionado) {
  let docentes;
  if (cursoSeleccionado) {
    docentes = data
      .filter(d => d.course_fullname === cursoSeleccionado)
      .map(d => `${d.user_fname} ${d.user_sname}`);
  } else {
    docentes = data.map(d => `${d.user_fname} ${d.user_sname}`);
  }
  return Array.from(new Set(docentes));
}

export function obtenerCursosSinDocente(data) {
  return Array.from(new Set(data.map((d) => d.course_fullname)));
}
