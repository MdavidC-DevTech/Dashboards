// src/pages/ProfesoresPage.js

import React, { useContext, useState, useEffect } from "react";
import { DataContext } from "../context/DataContext";
import useInternalLoader from "../hooks/useInternalLoader";

import {
  obtenerCursosFiltrados,
  obtenerDocentesFiltrados,
  agruparDataPorMes,
  agruparDataPorAnio,
  agruparDataPorDia,
} from "../utils/dataUtils";

import BarraActivos from "../components/BarraActivos";
import PieCursos from "../components/PieCursos";
import RankingBarrasProfesores from "../components/RankingBarrasProfesores";
import SearchableSelect from "../components/SearchableSelect";
import ExportCSVButton from "../components/ExportCSVButton";
import Loader from "../components/Loader";

import { FaChalkboardTeacher, FaChartBar, FaClock } from "react-icons/fa";
import { limpiarNombreColegio } from "../utils/stringUtils";
import { calcularMeta } from "../utils/calcularMeta";
import "../styles/pages.css";

/* 
  1) Función que obtiene el lunes y domingo de la semana actual (para el filtro "día")
*/
const obtenerRangoSemanaActual = () => {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0 = domingo
  const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  const diffDomingo = diaSemana === 0 ? 0 : 7 - diaSemana;

  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diffLunes);

  const domingo = new Date(hoy);
  domingo.setDate(hoy.getDate() + diffDomingo);

  const formatear = (fecha) => fecha.toISOString().split("T")[0];
  return { inicio: formatear(lunes), fin: formatear(domingo) };
};

/* 
  2) Función que unifica la data final de:
      - Actividad (Barras) 
      - Distribución (Pie + porcentajes)
      - Ranking (Top 10, Bottom 10)
     en un solo CSV.
*/
const getUnifiedData = (actividad, pieCursosFinal, rankingFinal, filtros) => {
  const unified = [];

  // Sección ACTIVIDAD
  unified.push({
    seccion: "Actividad",
    descripcion: `Actividad${filtros.unidadTiempo === "minutos" ? "Minutos" : "Horas"}_${filtros.yearSeleccionado || "Todos"}`,
    fecha: "",
    total: "",
    curso: "",
    tiempo: "",
    profesor: "",
  });
  unified.push({
    seccion: "",
    descripcion: "",
    fecha: "Fecha",
    total: "Total",
    curso: "",
    tiempo: "",
    profesor: "",
  });
  actividad.forEach((item) => {
    unified.push({
      seccion: "",
      descripcion: "",
      fecha: item.mes,   // "mes" o "dia" según la agrupación
      total: item.total,
      curso: "",
      tiempo: "",
      profesor: "",
    });
  });
  unified.push({});

  // Sección DISTRIBUCIÓN (pieCursosFinal ya contiene [ name, value, percentage ])
  unified.push({
    seccion: "Distribución",
    descripcion: `DistribucionTiempo_${filtros.yearSeleccionado || "Todos"}_${filtros.cursoSeleccionado || "Todos"}`,
    fecha: "",
    total: "",
    curso: "",
    tiempo: "",
    profesor: "",
  });
  unified.push({
    seccion: "",
    descripcion: "",
    fecha: "Curso",
    total: "Minutos",
    curso: "Porcentaje",
    tiempo: "",
    profesor: "",
  });
  pieCursosFinal.forEach((item) => {
    unified.push({
      seccion: "",
      descripcion: "",
      fecha: item.name,       // Nombre del curso
      total: item.value,      // Minutos
      curso: item.percentage, // Porcentaje
      tiempo: "",
      profesor: "",
    });
  });
  unified.push({});

  // Sección RANKING (rankingFinal = top + bottom con "rankingType")
  unified.push({
    seccion: "Ranking",
    descripcion: `RankingProfesores_${filtros.yearSeleccionado || "Todos"}_${filtros.cursoSeleccionado || "Todos"}`,
    fecha: "",
    total: "",
    curso: "",
    tiempo: "",
    profesor: "",
  });
  unified.push({
    seccion: "",
    descripcion: "",
    fecha: "rankingType",        // "TOP" o "BOTTOM"
    total: "Minutos",
    curso: "",
    tiempo: "",
    profesor: "Profesor",
  });
  rankingFinal.forEach((item) => {
    unified.push({
      seccion: "",
      descripcion: "",
      fecha: item.rankingType,    // "TOP" / "BOTTOM"
      total: item.minutos,        // Los mismos minutos que se grafican
      curso: "",
      tiempo: "",
      profesor: item.name,        // Nombre del profesor
    });
  });

  return unified;
};

const ProfesoresPage = () => {
  const { data, loadingData, errorData, loadData, collegeName } = useContext(DataContext);
  const { internalLoading, runWithLoader } = useInternalLoader();

  const nombreColegioLimpio = collegeName ? limpiarNombreColegio(collegeName) : "Mi Colegio";

  // Filtros
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [docenteSeleccionado, setDocenteSeleccionado] = useState("");
  const [yearSeleccionado, setYearSeleccionado] = useState("");
  const [unidadTiempo, setUnidadTiempo] = useState("minutos");
  const [agrupacionModo, setAgrupacionModo] = useState("mes");

  // Rango de fechas (para "día")
  const { inicio: fechaInicioDefault, fin: fechaFinDefault } = obtenerRangoSemanaActual();
  const [fechaInicio, setFechaInicio] = useState(fechaInicioDefault);
  const [fechaFin, setFechaFin] = useState(fechaFinDefault);

  // Opciones de selects
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [docentesDisponibles, setDocentesDisponibles] = useState([]);
  const [aniosDisponibles, setAniosDisponibles] = useState([]);

  // Data final para cada sección
  const [dataActividad, setDataActividad] = useState([]);  // Para BarraActivos
  const [dataDistribucion, setDataDistribucion] = useState([]); // Para PieCursos (bruto)
  const [pieCursosFinal, setPieCursosFinal] = useState([]);     // Recibido desde PieCursos
  const [dataRanking, setDataRanking] = useState([]);           // Bruto para Ranking
  const [rankingFinal, setRankingFinal] = useState([]);         // Recibido desde RankingBarrasProfesores

  // Meta calculada
  const [meta, setMeta] = useState(0);

  // 1) Actualizar selects en base a la data
  useEffect(() => {
    if (data && data.length > 0) {
      const soloProfes = data.filter((d) => d.role_shortname === "teacher");

      const cursos = obtenerCursosFiltrados(soloProfes, docenteSeleccionado);
      setCursosDisponibles(cursos);
      if (cursoSeleccionado && !cursos.includes(cursoSeleccionado)) {
        setCursoSeleccionado("");
      }

      const docentes = obtenerDocentesFiltrados(soloProfes, cursoSeleccionado);
      setDocentesDisponibles(docentes);

      const anios = [...new Set(soloProfes.map((d) => new Date(d.event_date).getFullYear().toString()))];
      setAniosDisponibles(anios);
    }
  }, [data, cursoSeleccionado, docenteSeleccionado]);

  // 2) Data Actividad (Barras)
  useEffect(() => {
    if (data && data.length > 0) {
      runWithLoader(() => {
        const soloProfes = data.filter((d) => d.role_shortname === "teacher");
        let filtrados = soloProfes;

        if (cursoSeleccionado) {
          filtrados = filtrados.filter((d) => d.course_fullname === cursoSeleccionado);
        }
        if (docenteSeleccionado) {
          filtrados = filtrados.filter((d) => `${d.user_fname} ${d.user_sname}` === docenteSeleccionado);
        }
        if (agrupacionModo === "dia") {
          const inicio = new Date(fechaInicio);
          const fin = new Date(fechaFin);
          filtrados = filtrados.filter((d) => {
            const fecha = new Date(d.event_date);
            return fecha >= inicio && fecha <= fin;
          });
        }

        let agrupados = [];
        if (agrupacionModo === "mes") {
          agrupados = agruparDataPorMes(filtrados, yearSeleccionado, unidadTiempo);
        } else if (agrupacionModo === "anio") {
          agrupados = agruparDataPorAnio(filtrados, yearSeleccionado, unidadTiempo);
        } else {
          agrupados = agruparDataPorDia(filtrados, yearSeleccionado, unidadTiempo);
        }
        setDataActividad(agrupados);
      });
    }
  }, [
    data,
    cursoSeleccionado,
    docenteSeleccionado,
    yearSeleccionado,
    unidadTiempo,
    agrupacionModo,
    fechaInicio,
    fechaFin,
    runWithLoader,
  ]);

  // 3) Data Distribución en bruto => { course_fullname, active_seconds }
  useEffect(() => {
    if (data && data.length > 0) {
      const soloProfes = data.filter((d) => d.role_shortname === "teacher");
      let filtrados = soloProfes;

      if (yearSeleccionado) {
        filtrados = filtrados.filter((d) => new Date(d.event_date).getFullYear().toString() === yearSeleccionado);
      }
      if (cursoSeleccionado) {
        filtrados = filtrados.filter((d) => d.course_fullname === cursoSeleccionado);
      }
      if (docenteSeleccionado) {
        filtrados = filtrados.filter((d) => `${d.user_fname} ${d.user_sname}` === docenteSeleccionado);
      }

      const mapCursos = {};
      filtrados.forEach((d) => {
        if (!mapCursos[d.course_fullname]) {
          mapCursos[d.course_fullname] = 0;
        }
        mapCursos[d.course_fullname] += Number(d.active_seconds);
      });

      const distArr = Object.entries(mapCursos).map(([course_fullname, totalSeconds]) => ({
        course_fullname,
        active_seconds: totalSeconds,
      }));
      setDataDistribucion(distArr);
    }
  }, [data, yearSeleccionado, cursoSeleccionado, docenteSeleccionado]);

  // 4) Data Ranking en bruto => { user_fname, user_sname, active_seconds, course_fullname }
  useEffect(() => {
    if (data && data.length > 0) {
      const soloProfes = data.filter((d) => d.role_shortname === "teacher");
      let filtrados = soloProfes;

      if (yearSeleccionado) {
        filtrados = filtrados.filter((d) => new Date(d.event_date).getFullYear().toString() === yearSeleccionado);
      }
      if (cursoSeleccionado) {
        filtrados = filtrados.filter((d) => d.course_fullname === cursoSeleccionado);
      }

      const rankingMap = {};
      filtrados.forEach((d) => {
        const nombre = `${d.user_fname} ${d.user_sname}`;
        if (!rankingMap[nombre]) {
          rankingMap[nombre] = {
            user_fname: d.user_fname,
            user_sname: d.user_sname,
            active_seconds: 0,
            course_fullname: d.course_fullname,
          };
        }
        rankingMap[nombre].active_seconds += Number(d.active_seconds);
      });
      const arr = Object.values(rankingMap);
      setDataRanking(arr);
    }
  }, [data, yearSeleccionado, cursoSeleccionado]);

  // 5) Calcular la meta
  useEffect(() => {
    const hayFiltros = Boolean(cursoSeleccionado || docenteSeleccionado || yearSeleccionado);
    const nuevaMeta = calcularMeta({
      agrupacionModo,
      unidadTiempo,
      cursoSeleccionado,
      hayFiltros,
    });
    setMeta(nuevaMeta);
  }, [agrupacionModo, unidadTiempo, cursoSeleccionado, docenteSeleccionado, yearSeleccionado]);

  // Manejo de carga y error
  if (loadingData) {
    return (
      <div className="loading-container">
        <h2>Cargando datos...</h2>
        <div className="loader"></div>
      </div>
    );
  }
  if (errorData) {
    return (
      <div className="loading-container">
        <h2 className="error-text">Error al cargar datos</h2>
        <p>{errorData.message}</p>
        <button onClick={loadData} className="btn-primary" style={{ marginTop: 10 }}>
          Reintentar
        </button>
      </div>
    );
  }
  if (internalLoading) {
    return <Loader />;
  }

  // === Callbacks para recibir la data final de Pie y Ranking ===
  // Pie: [{ name, value, percentage }, ...]


  // Unificamos todo para CSV
  const filtros = {
    unidadTiempo,
    yearSeleccionado,
    cursoSeleccionado,
  };
  const unifiedData = getUnifiedData(dataActividad, pieCursosFinal, rankingFinal, filtros);

  // Definir headers del CSV unificado
  const unifiedHeaders = [
    { label: "Sección", key: "seccion" },
    { label: "Descripción", key: "descripcion" },
    { label: "Fecha", key: "fecha" },
    { label: "Total", key: "total" },
    { label: "Curso", key: "curso" },
    { label: "Tiempo", key: "tiempo" },
    { label: "Profesor", key: "profesor" },
  ];

  const nombreCole = nombreColegioLimpio || "Mi Colegio";

  return (
    <div className="page-container">
      <h1 className="page-title">{nombreCole} (Profesores)</h1>

      {/* Botón CSV unificado */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <ExportCSVButton
          data={unifiedData}
          headers={unifiedHeaders}
          filename="reporte_profesores.csv"
          separator=";"
        />
      </div>

      {/* Tarjeta de Filtros */}
      <div className="page-card">
        <div className="page-card-header">
          <FaChalkboardTeacher />
          <span>Filtros</span>
        </div>
        <div className="page-card-body">
          <div className="filter-group">
            {/* Unidad de tiempo */}
            <div className="filter-item">
              <label>
                <FaClock /> Unidad de tiempo:
              </label>
              <select
                value={unidadTiempo}
                onChange={(e) => setUnidadTiempo(e.target.value)}
              >
                <option value="minutos">Minutos</option>
                <option value="horas">Horas</option>
              </select>
            </div>

            {/* Agrupar por */}
            <div className="filter-item">
              <label>Agrupar por:</label>
              <div>
                <label style={{ marginRight: 10 }}>
                  <input
                    type="radio"
                    name="agrupacion"
                    value="mes"
                    checked={agrupacionModo === "mes"}
                    onChange={() => setAgrupacionModo("mes")}
                  />
                  Mes
                </label>
                <label style={{ marginRight: 10 }}>
                  <input
                    type="radio"
                    name="agrupacion"
                    value="anio"
                    checked={agrupacionModo === "anio"}
                    onChange={() => setAgrupacionModo("anio")}
                  />
                  Año
                </label>
                <label>
                  <input
                    type="radio"
                    name="agrupacion"
                    value="dia"
                    checked={agrupacionModo === "dia"}
                    onChange={() => setAgrupacionModo("dia")}
                  />
                  Día
                </label>
              </div>
            </div>

            {/* Año solo si no es "día" */}
            {agrupacionModo !== "dia" && (
              <div className="filter-item">
                <SearchableSelect
                  label="Año"
                  options={aniosDisponibles}
                  value={yearSeleccionado}
                  onChange={setYearSeleccionado}
                />
              </div>
            )}

            {/* Curso */}
            <div className="filter-item">
              <SearchableSelect
                label="Curso"
                options={cursosDisponibles}
                value={cursoSeleccionado}
                onChange={setCursoSeleccionado}
              />
            </div>

            {/* Docente */}
            <div className="filter-item">
              <SearchableSelect
                label="Docente"
                options={docentesDisponibles}
                value={docenteSeleccionado}
                onChange={setDocenteSeleccionado}
              />
            </div>
          </div>

          {/* Fechas si agrupacion es "día" */}
          {agrupacionModo === "dia" && (
            <div className="filter-group">
              <div className="filter-item">
                <label>Fecha Inicio:</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="filter-item">
                <label>Fecha Fin:</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tarjeta Actividad (Barras) */}
      <div className="page-card">
        <div className="page-card-header">
          <FaChartBar />
          <span>Actividad en {unidadTiempo === "horas" ? "Horas" : "Minutos"}</span>
        </div>
        <div className="page-card-body">
          <BarraActivos data={dataActividad} unidadTiempo={unidadTiempo} meta={meta} />
        </div>
      </div>

      {/* Tarjeta Distribución (PieCursos) */}
      <div className="page-card">
        <div className="page-card-header">
          <FaChartBar />
          <span>Distribución del tiempo por curso</span>
        </div>
        <div className="page-card-body">
          {/*
            Notamos a PieCursos la data bruta (course_fullname, active_seconds),
            y la prop onPieDataChange para recibir la data final que él calcule 
            (incluyendo el porcentaje).
          */}
          <PieCursos data={dataDistribucion} onPieDataChange={setPieCursosFinal} />
        </div>
      </div>

      {/* Tarjeta Ranking (Top/Bottom) */}
      <div className="page-card">
        <div className="page-card-header">
          <FaChartBar />
          <span>Ranking de Profesores</span>
        </div>
        <div className="page-card-body">
          {/*
            Pasamos la data bruta (dataRanking) y la prop onRankingDataChange
            para obtener el array final de top/bottom (con "rankingType"),
            tal cual se grafica.
          */}
          <RankingBarrasProfesores
            data={dataRanking}
            onRankingDataChange={setRankingFinal}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfesoresPage;
