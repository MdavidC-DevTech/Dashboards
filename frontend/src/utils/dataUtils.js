// src/utils/dataUtils.js

function extraerMes(fechaString) {
  const fecha = new Date(fechaString);
  return fecha.toLocaleString("es-ES", { month: "long" }).toLowerCase();
}
// Función que convierte segundos a la unidad deseada
export function convertirSegundos(segundos, unidadTiempo = "minutos") {
  if (unidadTiempo === "minutos") {
    // Convierte a minutos y redondea a entero
    return Math.round(segundos / 60);
  } else if (unidadTiempo === "horas") {
    // Primero convierte a minutos y redondea, luego a horas con 2 decimales
    return parseFloat((segundos / 3600).toFixed(2));
  }
}


export function agruparDataPorMes(data, yearSeleccionado, unidadTiempo = "minutos") {
  const map = {};
  data.forEach(item => {
    if (!item.event_date) return;
    const fecha = new Date(item.event_date);
    const anio = fecha.getFullYear().toString();
    if (yearSeleccionado && anio !== yearSeleccionado) return;
    const mes = extraerMes(item.event_date);
    // Utiliza la función de conversión para obtener el valor
    const valor = convertirSegundos(item.active_seconds, unidadTiempo);
    if (!map[mes]) {
      map[mes] = { mes, total: 0 };
    }
    map[mes].total += valor;
  });
  const ordenMeses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  
  // Aplicar redondeo final a 2 decimales si la unidad es "horas"
  const resultado = Object.values(map).map(item => ({
    ...item,
    total: unidadTiempo === "horas" ? parseFloat(item.total.toFixed(2)) : item.total
  }));
  
  return resultado.sort((a, b) => ordenMeses.indexOf(a.mes) - ordenMeses.indexOf(b.mes));
}



export function agruparDataPorAnio(data, yearSeleccionado, unidadTiempo = "minutos") {
  const map = {};
  data.forEach(item => {
    if (!item.event_date) return;
    const fecha = new Date(item.event_date);
    const anio = fecha.getFullYear().toString();
    if (yearSeleccionado && anio !== yearSeleccionado) return;
    const valor = convertirSegundos(item.active_seconds, unidadTiempo);
    if (!map[anio]) {
      map[anio] = { mes: anio, total: 0 };
    }
    map[anio].total += valor;
  });
  const resultado = Object.values(map).map(item => ({
    ...item,
    total: unidadTiempo === "horas" ? parseFloat(item.total.toFixed(2)) : item.total
  }));
  return resultado.sort((a, b) => a.mes.localeCompare(b.mes));
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


// agruparDataPorDia: agrupa la data por día (dd-mm-yyyy) y suma los valores
export function agruparDataPorDia(data, yearSeleccionado, unidadTiempo = "minutos") {
  const map = {};
  data.forEach(item => {
    if (!item.event_date) return;

    const fecha = new Date(item.event_date);
    const anio = fecha.getFullYear().toString();
    if (yearSeleccionado && anio !== yearSeleccionado) return;

    // Formato de día, por ejemplo dd-mm-yyyy
    // Nota: Puedes usar toLocaleDateString u otra librería para formatear
    const dia = fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }); 
    // Conviertes los active_seconds
    const valor = convertirSegundos(item.active_seconds, unidadTiempo);

    if (!map[dia]) {
      map[dia] = { mes: dia, total: 0 }; 
      // Usamos "mes" como key en la gráfica, 
      // pero en realidad es "día" (podrías llamarlo "dia" en lugar de "mes")
    }
    map[dia].total += valor;
  });

  // Convertimos el objeto a array
  const resultado = Object.values(map);

  // Ordenamos por fecha (opcional)
  // Cada item.mes es algo como "31/01/2024", parseamos y ordenamos
  resultado.sort((a, b) => {
    const [diaA, mesA, anioA] = a.mes.split("/");
    const [diaB, mesB, anioB] = b.mes.split("/");
    const fechaA = new Date(+anioA, +mesA - 1, +diaA);
    const fechaB = new Date(+anioB, +mesB - 1, +diaB);
    return fechaA - fechaB;
  });

  // Redondeo final si es horas
  if (unidadTiempo === "horas") {
    resultado.forEach(item => {
      item.total = parseFloat(item.total.toFixed(2));
    });
  }

  return resultado;
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
export function obtenerEstudiantesFiltrados(data, cursoSeleccionado) {
  let estudiantes;
  if (cursoSeleccionado) {
    estudiantes = data
      .filter(d => d.course_fullname === cursoSeleccionado)
      .map(d => `${d.user_fname} ${d.user_sname}`);
  } else {
    estudiantes = data.map(d => `${d.user_fname} ${d.user_sname}`);
  }
  return Array.from(new Set(estudiantes));
}


export function obtenerCursosSinDocente(data) {
  return Array.from(new Set(data.map((d) => d.course_fullname)));
}
