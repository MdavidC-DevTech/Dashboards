// src/pages/ProfesoresPage.js
import React, { useContext, useState, useEffect } from "react";
import { DataContext } from "../context/DataContext";
import useInternalLoader from "../hooks/useInternalLoader";
import {
  obtenerCursosFiltrados,
  obtenerDocentesFiltrados,
  agruparDataPorMes,
  agruparDataPorAnio,
  agruparDataPorDia, // Función para agrupar por día
} from "../utils/dataUtils";
import BarraActivos from "../components/BarraActivos";
import SearchableSelect from "../components/SearchableSelect";
import "../styles/pages.css";
import { FaChalkboardTeacher, FaChartBar, FaClock } from "react-icons/fa";
import Loader from "../components/Loader";
import { limpiarNombreColegio } from "../utils/stringUtils";
import PieCursos from "../components/PieCursos";
import RankingBarrasProfesores from "../components/RankingBarrasProfesores";
import { calcularMeta } from "../utils/calcularMeta";
import ExportCSVButton from "../components/ExportCSVButton";

// Función para obtener el lunes y domingo de la semana actual
const obtenerRangoSemanaActual = () => {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0: domingo, 1: lunes, etc.
  const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  const diffDomingo = diaSemana === 0 ? 0 : 7 - diaSemana;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diffLunes);
  const domingo = new Date(hoy);
  domingo.setDate(hoy.getDate() + diffDomingo);
  const formatear = (fecha) => fecha.toISOString().split("T")[0];
  return { inicio: formatear(lunes), fin: formatear(domingo) };
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

  // Estado para el rango de fechas (cuando se agrupa por día)
  const { inicio: fechaInicioDefault, fin: fechaFinDefault } = obtenerRangoSemanaActual();
  const [fechaInicio, setFechaInicio] = useState(fechaInicioDefault);
  const [fechaFin, setFechaFin] = useState(fechaFinDefault);

  // Opciones para selectores
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [docentesDisponibles, setDocentesDisponibles] = useState([]);
  const [aniosDisponibles, setAniosDisponibles] = useState([]);

  // Datos agrupados para la gráfica de barras
  const [dataAgrupada, setDataAgrupada] = useState([]);
  // Datos para el PieChart
  const [dataPorCursoProfes, setDataPorCursoProfes] = useState([]);
  // Data para Ranking (Top 10 y Bottom 10)
  const [dataRankingProfesores, setDataRankingProfesores] = useState([]);

  // Estado para la meta calculada dinámicamente
  const [meta, setMeta] = useState(0);



  
  // 1. Actualizar opciones de filtros basados en la data
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
      const anios = Array.from(
        new Set(soloProfes.map((d) => new Date(d.event_date).getFullYear().toString()))
      );
      setAniosDisponibles(anios);
    }
  }, [data, cursoSeleccionado, docenteSeleccionado]);

  // 2. Agrupar data para la gráfica de barras (incluye filtrado por rango si agrupación es "día")
  useEffect(() => {
    if (data && data.length > 0) {
      runWithLoader(async () => {
        const soloProfes = data.filter((d) => d.role_shortname === "teacher");
        let filtrados = soloProfes;
        if (cursoSeleccionado) {
          filtrados = filtrados.filter((d) => d.course_fullname === cursoSeleccionado);
        }
        if (docenteSeleccionado) {
          filtrados = filtrados.filter(
            (d) => `${d.user_fname} ${d.user_sname}` === docenteSeleccionado
          );
        }
        if (agrupacionModo === "dia") {
          const inicio = new Date(fechaInicio);
          const fin = new Date(fechaFin);
          filtrados = filtrados.filter((d) => {
            const fecha = new Date(d.event_date);
            return fecha >= inicio && fecha <= fin;
          });
        }
        const agrupados =
          agrupacionModo === "mes"
            ? agruparDataPorMes(filtrados, yearSeleccionado, unidadTiempo)
            : agrupacionModo === "anio"
            ? agruparDataPorAnio(filtrados, yearSeleccionado, unidadTiempo)
            : agruparDataPorDia(filtrados, yearSeleccionado, unidadTiempo);
        setDataAgrupada(agrupados);
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

  // 3. Agrupar datos para el PieChart de profesores
  useEffect(() => {
    if (data && data.length > 0) {
      const soloProfes = data.filter((d) => d.role_shortname === "teacher");
      let filtrados = soloProfes;
      if (yearSeleccionado) {
        filtrados = filtrados.filter(
          (d) => new Date(d.event_date).getFullYear().toString() === yearSeleccionado
        );
      }
      if (cursoSeleccionado) {
        filtrados = filtrados.filter((d) => d.course_fullname === cursoSeleccionado);
      }
      if (docenteSeleccionado) {
        filtrados = filtrados.filter(
          (d) => `${d.user_fname} ${d.user_sname}` === docenteSeleccionado
        );
      }
      const cursosMap = {};
      filtrados.forEach((d) => {
        if (!cursosMap[d.course_fullname]) {
          cursosMap[d.course_fullname] = 0;
        }
        cursosMap[d.course_fullname] += Number(d.active_seconds);
      });
      const dataAgrupadaCursos = Object.entries(cursosMap).map(
        ([course_fullname, active_seconds]) => ({
          course_fullname,
          active_seconds,
        })
      );
      setDataPorCursoProfes(dataAgrupadaCursos);
    }
  }, [data, cursoSeleccionado, docenteSeleccionado, yearSeleccionado]);

  // 4. Data para Ranking (Top 10 / Bottom 10) sin aplicar el filtro de docente
  useEffect(() => {
    if (data && data.length > 0) {
      const soloProfes = data.filter((d) => d.role_shortname === "teacher");
      let filtrados = soloProfes;
      if (yearSeleccionado) {
        filtrados = filtrados.filter(
          (d) => new Date(d.event_date).getFullYear().toString() === yearSeleccionado
        );
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
      const rankingArr = Object.values(rankingMap);
      setDataRankingProfesores(rankingArr);
    }
  }, [data, yearSeleccionado, cursoSeleccionado]);

  // 5. Recalcular la meta según los filtros
  useEffect(() => {
    const hayFiltros = !!(cursoSeleccionado || docenteSeleccionado || yearSeleccionado);
    const nuevaMeta = calcularMeta({
      agrupacionModo,
      unidadTiempo,
      cursoSeleccionado,
      hayFiltros,
    });
    setMeta(nuevaMeta);
  }, [agrupacionModo, unidadTiempo, cursoSeleccionado, docenteSeleccionado, yearSeleccionado]);

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

  // Definir headers dinámicos para exportar la data agrupada (para profesores)
  let csvHeaders = [];
  if (agrupacionModo === "mes" || agrupacionModo === "dia") {
    csvHeaders = [
      { label: "Fecha", key: "mes" },
      { label: "Total", key: "total" },
    ];
  } else if (agrupacionModo === "anio") {
    csvHeaders = [
      { label: "Año", key: "mes" },
      { label: "Total", key: "total" },
    ];
  }

  return (
    <div className="page-container">
      <h1 className="page-title">{nombreColegioLimpio} (Profesores)</h1>

      {/* Botón para exportar CSV de la data agrupada */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <ExportCSVButton
          data={dataAgrupada}
          filename="datos_profesores.csv"
          headers={csvHeaders}
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

            {/* Mostrar filtro de Año solo si agrupación no es "día" */}
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
          {/* Si agrupación es "día", mostrar selectores de rango de fechas */}
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

      {/* Tarjeta de Gráfica de Barras */}
      <div className="page-card">
        <div className="page-card-header">
          <FaChartBar />
          <span>Actividad en {unidadTiempo === "horas" ? "Horas" : "Minutos"}</span>
        </div>
        <div className="page-card-body">
          <BarraActivos data={dataAgrupada} unidadTiempo={unidadTiempo} meta={meta} />
        </div>
      </div>

      {/* Tarjeta con PieCursos */}
      <div className="page-card">
        <div className="page-card-header">
          <FaChartBar />
          <span>Distribución del tiempo por curso (Profesores)</span>
        </div>
        <div className="page-card-body">
          <PieCursos data={dataPorCursoProfes} />
        </div>
      </div>

      {/* Tarjeta de Ranking */}
      <div className="page-card">
        <div className="page-card-header">
          <FaChartBar />
          <span>Ranking de Profesores (Top 10 y Bottom 10)</span>
        </div>
        <div className="page-card-body">
          <RankingBarrasProfesores data={dataRankingProfesores} />
        </div>
      </div>
    </div>
  );
};

export default ProfesoresPage;
