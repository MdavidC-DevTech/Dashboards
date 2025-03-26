// src/pages/ProfesoresPage.js
import React, { useContext, useState, useEffect } from "react";
import { DataContext } from "../context/DataContext";
import useInternalLoader from "../hooks/useInternalLoader";
import {
  obtenerCursosFiltrados,
  obtenerDocentesFiltrados,
  agruparDataPorMes,
  agruparDataPorAnio,
} from "../utils/dataUtils";
import BarraActivos from "../components/BarraActivos";
import SearchableSelect from "../components/SearchableSelect";
import "../styles/pages.css";
import { FaChalkboardTeacher, FaChartBar, FaClock } from "react-icons/fa";
import Loader from "../components/Loader";
import { limpiarNombreColegio } from "../utils/stringUtils";
import PieCursos from "../components/PieCursos";
import RankingBarrasProfesores from "../components/RankingBarrasProfesores";


function ProfesoresPage() {
  const { data, loadingData, errorData, loadData, collegeName } = useContext(DataContext);
  const { internalLoading, runWithLoader } = useInternalLoader();

  const nombreColegioLimpio = collegeName ? limpiarNombreColegio(collegeName) : "Mi Colegio";

  // Estados para filtros
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [docenteSeleccionado, setDocenteSeleccionado] = useState("");
  const [yearSeleccionado, setYearSeleccionado] = useState("");
  const [unidadTiempo, setUnidadTiempo] = useState("minutos");
  const [agrupacionModo, setAgrupacionModo] = useState("mes");

  // Estados para opciones y datos agrupados
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [docentesDisponibles, setDocentesDisponibles] = useState([]);
  const [aniosDisponibles, setAniosDisponibles] = useState([]);
  const [dataAgrupada, setDataAgrupada] = useState([]);
  const [dataPorCursoProfes, setDataPorCursoProfes] = useState([]);
  // Estado para la data de ranking (para profesores, ignorando el filtro de docente)
  const [dataRankingProfesores, setDataRankingProfesores] = useState([]);


  // Actualizar opciones de filtros basados en la data
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

  // Operaciones internas para la gráfica de barras
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
        const agrupados =
          agrupacionModo === "mes"
            ? agruparDataPorMes(filtrados, yearSeleccionado, unidadTiempo)
            : agruparDataPorAnio(filtrados, yearSeleccionado, unidadTiempo);
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
    runWithLoader,
  ]);

  // Nuevo useEffect: Agrupar datos por curso para el PieChart de profesores
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

  useEffect(() => {
    if (data && data.length > 0) {
      const soloProfes = data.filter((d) => d.role_shortname === "teacher");
      let filtrados = soloProfes;
      // Aplica los filtros de año y curso, pero NO el filtro de docente
      if (yearSeleccionado) {
        filtrados = filtrados.filter(
          (d) => new Date(d.event_date).getFullYear().toString() === yearSeleccionado
        );
      }
      if (cursoSeleccionado) {
        filtrados = filtrados.filter((d) => d.course_fullname === cursoSeleccionado);
      }
      // Agrupar active_seconds por profesor
      const rankingMap = {};
      filtrados.forEach((d) => {
        const nombre = `${d.user_fname} ${d.user_sname}`;
        if (!rankingMap[nombre]) {
          rankingMap[nombre] = {
            user_fname: d.user_fname,
            user_sname: d.user_sname,
            active_seconds: 0,
            course_fullname: d.course_fullname, // Guardamos el curso para el tooltip
          };
        }
        rankingMap[nombre].active_seconds += Number(d.active_seconds);
      });
      const rankingArr = Object.values(rankingMap);
      setDataRankingProfesores(rankingArr);
    }
  }, [data, yearSeleccionado, cursoSeleccionado]);


  // Manejo de carga y errores
  if (internalLoading) {
    return <Loader />;
  }
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

  return (
    <div className="page-container">
      <h1 className="page-title">{nombreColegioLimpio} (Profesores)</h1>

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
                <label>
                  <input
                    type="radio"
                    name="agrupacion"
                    value="anio"
                    checked={agrupacionModo === "anio"}
                    onChange={() => setAgrupacionModo("anio")}
                  />
                  Año
                </label>
              </div>
            </div>

            {/* Año */}
            <div className="filter-item">
              <SearchableSelect
                label="Año"
                options={aniosDisponibles}
                value={yearSeleccionado}
                onChange={setYearSeleccionado}
              />
            </div>

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
        </div>
      </div>

      {/* Tarjeta de Gráfica de barras */}
      <div className="page-card">
        <div className="page-card-header">
          <FaChartBar />
          <span>Actividad en {unidadTiempo === "horas" ? "Horas" : "Minutos"}</span>
        </div>
        <div className="page-card-body">
          <BarraActivos data={dataAgrupada} unidadTiempo={unidadTiempo} />
        </div>
      </div>

      {/* Tarjeta con PieCursos para Profesores */}
      <div className="page-card">
        <div className="page-card-header">
          <FaChartBar />
          <span>Distribución del tiempo por curso (Profesores)</span>
        </div>
        <div className="page-card-body">
          <PieCursos data={dataPorCursoProfes} />
        </div>
      </div>

      {/* Ranking de Profesores (Top 10 y Bottom 10) */}
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
}

export default ProfesoresPage;
