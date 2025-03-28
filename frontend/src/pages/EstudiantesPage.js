// src/pages/EstudiantesPage.js

import React, { useContext, useState, useEffect } from "react";
import { DataContext } from "../context/DataContext";
import useInternalLoader from "../hooks/useInternalLoader";
import {
  obtenerCursosFiltrados,
  obtenerEstudiantesFiltrados,
  agruparDataPorMes,
  agruparDataPorAnio,
  agruparDataPorDia,
} from "../utils/dataUtils";
import { calcularMeta } from "../utils/calcularMeta";
import { limpiarNombreColegio } from "../utils/stringUtils";

import BarraActivos from "../components/BarraActivos";
import PieCursos from "../components/PieCursos";
import RankingBarrasEstudiantes from "../components/RankingBarrasEstudiantes";
import SearchableSelect from "../components/SearchableSelect";
import ExportCSVButton from "../components/ExportCSVButton";
import Loader from "../components/Loader";

import { FaUserGraduate, FaChartBar, FaClock } from "react-icons/fa";
import "../styles/pages.css";

// 1) Función para “día” (por defecto, la semana actual)
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

/**
 * @function getUnifiedData
 * Unifica la data final de:
 *   - Actividad (barras): dataActividad 
 *   - Distribución (pie con porcentaje): pieCursosFinal 
 *   - Ranking (top/bottom): rankingEstudiantesFinal
 *   - filtros: para poder armar un “descripcion” más descriptivo
 */
const getUnifiedData = (dataActividad, pieCursosFinal, rankingEstudiantesFinal, filtros) => {
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
  dataActividad.forEach((item) => {
    unified.push({
      seccion: "",
      descripcion: "",
      fecha: item.mes, // mes o día
      total: item.total,
      curso: "",
      tiempo: "",
      profesor: "",
    });
  });
  unified.push({});

  // Sección DISTRIBUCIÓN
  unified.push({
    seccion: "Distribución",
    descripcion: `DistribuciónTiempo_${filtros.yearSeleccionado || "Todos"}_${filtros.cursoSeleccionado || "Todos"}`,
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
      fecha: item.name,     // Nombre del curso
      total: item.value,    // Minutos
      curso: `${item.percentage}%`,
      tiempo: "",
      profesor: "",
    });
  });
  unified.push({});

  // Sección RANKING
  unified.push({
    seccion: "Ranking",
    descripcion: `RankingEstudiantes_${filtros.yearSeleccionado || "Todos"}_${filtros.cursoSeleccionado || "Todos"}`,
    fecha: "",
    total: "",
    curso: "",
    tiempo: "",
    profesor: "",
  });
  unified.push({
    seccion: "",
    descripcion: "",
    fecha: "",
    total: "",
    curso: "RankingType",
    tiempo: "Minutos",
    profesor: "Estudiante",
  });
  rankingEstudiantesFinal.forEach((item) => {
    unified.push({
      seccion: "",
      descripcion: "",
      fecha: "",
      total: "",
      curso: item.rankingType,  // "TOP" or "BOTTOM"
      tiempo: item.minutos,     // Minutos
      profesor: item.name,      // "Nombre Apellido"
    });
  });

  return unified;
};

const EstudiantesPage = () => {
  const { data, loadingData, errorData, loadData, collegeName } = useContext(DataContext);
  const { internalLoading, runWithLoader } = useInternalLoader();

  const nombreColegioLimpio = collegeName ? limpiarNombreColegio(collegeName) : "Mi Colegio";

  // Filtros
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState("");
  const [yearSeleccionado, setYearSeleccionado] = useState("");
  const [unidadTiempo, setUnidadTiempo] = useState("minutos");
  const [agrupacionModo, setAgrupacionModo] = useState("mes");

  // Rango de fecha si se agrupa por día
  const { inicio: fechaInicioDefault, fin: fechaFinDefault } = obtenerRangoSemanaActual();
  const [fechaInicio, setFechaInicio] = useState(fechaInicioDefault);
  const [fechaFin, setFechaFin] = useState(fechaFinDefault);

  // Opciones (combos)
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([]);
  const [aniosDisponibles, setAniosDisponibles] = useState([]);

  // Data final para cada sección
  const [dataActividad, setDataActividad] = useState([]);        // para <BarraActivos>
  const [dataDistribucion, setDataDistribucion] = useState([]);  // para <PieCursos> (en bruto)
  const [pieCursosFinal, setPieCursosFinal] = useState([]);      // con % devuelto por <PieCursos>
  const [dataRanking, setDataRanking] = useState([]);            // en bruto, para <RankingBarrasEstudiantes>
  const [rankingEstudiantesFinal, setRankingEstudiantesFinal] = useState([]); // top/bottom final

  const [meta, setMeta] = useState(0);

  // 1) Actualizar combos en base a la data
  useEffect(() => {
    if (data && data.length > 0) {
      const soloEst = data.filter((d) => d.role_shortname === "student");

      const cursos = obtenerCursosFiltrados(soloEst, estudianteSeleccionado);
      setCursosDisponibles(cursos);
      if (cursoSeleccionado && !cursos.includes(cursoSeleccionado)) {
        setCursoSeleccionado("");
      }

      const estudiantes = obtenerEstudiantesFiltrados(soloEst, cursoSeleccionado);
      setEstudiantesDisponibles(estudiantes);

      const anios = Array.from(
        new Set(soloEst.map((d) => new Date(d.event_date).getFullYear().toString()))
      );
      setAniosDisponibles(anios);
    }
  }, [data, cursoSeleccionado, estudianteSeleccionado]);

  // 2) Data Actividad (Barras)
  useEffect(() => {
    if (data && data.length > 0) {
      runWithLoader(() => {
        const soloEst = data.filter((d) => d.role_shortname === "student");
        let filtrados = soloEst;

        if (cursoSeleccionado) {
          filtrados = filtrados.filter((d) => d.course_fullname === cursoSeleccionado);
        }
        if (estudianteSeleccionado) {
          filtrados = filtrados.filter(
            (d) => `${d.user_fname} ${d.user_sname}` === estudianteSeleccionado
          );
        }
        if (agrupacionModo === "dia") {
          const inicio = new Date(fechaInicio);
          const fin = new Date(fechaFin);
          filtrados = filtrados.filter((d) => {
            const f = new Date(d.event_date);
            return f >= inicio && f <= fin;
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
    estudianteSeleccionado,
    yearSeleccionado,
    unidadTiempo,
    agrupacionModo,
    fechaInicio,
    fechaFin,
    runWithLoader,
  ]);

  // 3) Data Distribución (en bruto)
  useEffect(() => {
    if (data && data.length > 0) {
      const soloEst = data.filter((d) => d.role_shortname === "student");
      let filtrados = soloEst;

      if (yearSeleccionado) {
        filtrados = filtrados.filter(
          (d) => new Date(d.event_date).getFullYear().toString() === yearSeleccionado
        );
      }
      if (cursoSeleccionado) {
        filtrados = filtrados.filter((d) => d.course_fullname === cursoSeleccionado);
      }
      if (estudianteSeleccionado) {
        filtrados = filtrados.filter(
          (d) => `${d.user_fname} ${d.user_sname}` === estudianteSeleccionado
        );
      }

      const map = {};
      filtrados.forEach((d) => {
        if (!map[d.course_fullname]) {
          map[d.course_fullname] = 0;
        }
        map[d.course_fullname] += Number(d.active_seconds);
      });

      const distArr = Object.entries(map).map(([course_fullname, active_seconds]) => ({
        course_fullname,
        active_seconds,
      }));
      setDataDistribucion(distArr);
    }
  }, [data, cursoSeleccionado, estudianteSeleccionado, yearSeleccionado]);

  // 4) Data Ranking (en bruto)
  useEffect(() => {
    if (data && data.length > 0) {
      const soloEst = data.filter((d) => d.role_shortname === "student");
      let filtrados = soloEst;

      if (yearSeleccionado) {
        filtrados = filtrados.filter(
          (d) => new Date(d.event_date).getFullYear().toString() === yearSeleccionado
        );
      }
      if (cursoSeleccionado) {
        filtrados = filtrados.filter((d) => d.course_fullname === cursoSeleccionado);
      }
      // Not filtering by "estudianteSeleccionado" because the ranking ignores it
      setDataRanking(filtrados);
    }
  }, [data, yearSeleccionado, cursoSeleccionado]);

  // 5) Calculamos la meta
  useEffect(() => {
    const hayFiltros = Boolean(cursoSeleccionado || estudianteSeleccionado || yearSeleccionado);
    const nuevaMeta = calcularMeta({
      agrupacionModo,
      unidadTiempo,
      cursoSeleccionado,
      hayFiltros,
    });
    setMeta(nuevaMeta);
  }, [agrupacionModo, unidadTiempo, cursoSeleccionado, estudianteSeleccionado, yearSeleccionado]);

  // 6) Callbacks para Pie y Ranking




  // 7) Unificamos la data para el CSV
  const filtros = {
    unidadTiempo,
    yearSeleccionado,
    cursoSeleccionado,
  };
  const unifiedData = getUnifiedData(dataActividad, pieCursosFinal, rankingEstudiantesFinal, filtros);

  const unifiedHeaders = [
    { label: "Sección", key: "seccion" },
    { label: "Descripción", key: "descripcion" },
    { label: "Fecha", key: "fecha" },
    { label: "Total", key: "total" },
    { label: "Curso", key: "curso" },
    { label: "Tiempo", key: "tiempo" },
    { label: "Profesor", key: "profesor" }, // para estudiantes => "Estudiante"
  ];

  // Manejo de carga y errores
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

  return (
    <div className="page-container">
      <h1 className="page-title">{nombreColegioLimpio} (Estudiantes)</h1>

      {/* Botón para exportar CSV unificado */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <ExportCSVButton
          data={unifiedData}
          filename="reporte_estudiantes.csv"
          headers={unifiedHeaders}
          separator=";"
        />
      </div>

      {/* Tarjeta de Filtros */}
      <div className="page-card">
        <div className="page-card-header">
          <FaUserGraduate />
          <span>Filtros</span>
        </div>
        <div className="page-card-body">
          <div className="filter-group">
            {/* Unidad de tiempo */}
            <div className="filter-item">
              <label>
                <FaClock /> Unidad de tiempo:
              </label>
              <select value={unidadTiempo} onChange={(e) => setUnidadTiempo(e.target.value)}>
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

            {/* Año (solo si no es “dia”) */}
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

            {/* Estudiante */}
            <div className="filter-item">
              <SearchableSelect
                label="Estudiante"
                options={estudiantesDisponibles}
                value={estudianteSeleccionado}
                onChange={setEstudianteSeleccionado}
              />
            </div>
          </div>

          {/* Si es “dia”, mostrar rango de fechas */}
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

      {/* Tarjeta Actividad */}
      <div className="page-card">
        <div className="page-card-header">
          <FaChartBar />
          <span>Actividad en {unidadTiempo === "horas" ? "Horas" : "Minutos"}</span>
        </div>
        <div className="page-card-body">
          <BarraActivos data={dataActividad} unidadTiempo={unidadTiempo} meta={meta} />
        </div>
      </div>

      {/* Tarjeta Distribución */}
      <div className="page-card">
        <div className="page-card-header">
          <FaChartBar />
          <span>Distribución del tiempo por curso (Estudiantes)</span>
        </div>
        <div className="page-card-body">
          <PieCursos
            data={dataDistribucion}
            onPieDataChange={setPieCursosFinal}
          />
        </div>
      </div>

      {/* Tarjeta Ranking */}
      <div className="page-card">
        <div className="page-card-header">
          <FaChartBar />
          <span>Ranking de Estudiantes (Top 10 y Bottom 10)</span>
        </div>
        <div className="page-card-body">
          <RankingBarrasEstudiantes
            data={dataRanking}
            onRankingDataChange={setRankingEstudiantesFinal}
          />
        </div>
      </div>
    </div>
  );
};

export default EstudiantesPage;
