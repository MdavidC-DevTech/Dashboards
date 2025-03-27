// src/pages/EstudiantesPage.js
import React, { useContext, useState, useEffect } from "react";
import { DataContext } from "../context/DataContext";
import {
  obtenerCursosFiltrados,
  agruparDataPorMes,
  agruparDataPorAnio,
  agruparDataPorDia,
  obtenerEstudiantesFiltrados,
} from "../utils/dataUtils";
import SearchableSelect from "../components/SearchableSelect";
import BarraActivos from "../components/BarraActivos";
import "../styles/pages.css";
import { FaUserGraduate, FaChartBar, FaClock } from "react-icons/fa";
import Loader from "../components/Loader";
import { limpiarNombreColegio } from "../utils/stringUtils";
import PieCursos from "../components/PieCursos";
import RankingBarrasEstudiantes from "../components/RankingBarrasEstudiantes";
import { calcularMeta } from "../utils/calcularMeta";

// Función para obtener el rango de la semana actual (por defecto)
const obtenerRangoSemanaActual = () => {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0 = domingo, 1 = lunes, etc.
  const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  const diffDomingo = diaSemana === 0 ? 0 : 7 - diaSemana;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diffLunes);
  const domingo = new Date(hoy);
  domingo.setDate(hoy.getDate() + diffDomingo);
  const formatear = (fecha) => fecha.toISOString().split("T")[0];
  return { inicio: formatear(lunes), fin: formatear(domingo) };
};

const EstudiantesPage = () => {
  const { data, loadingData, errorData, loadData, collegeName } = useContext(DataContext);

  // Filtros
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState("");
  const [yearSeleccionado, setYearSeleccionado] = useState("");
  const [unidadTiempo, setUnidadTiempo] = useState("minutos");
  const [agrupacionModo, setAgrupacionModo] = useState("mes");

  // Estado para el rango de fechas (aplica cuando agrupación es "día")
  const { inicio: fechaInicioDefault, fin: fechaFinDefault } = obtenerRangoSemanaActual();
  const [fechaInicio, setFechaInicio] = useState(fechaInicioDefault);
  const [fechaFin, setFechaFin] = useState(fechaFinDefault);

  // Opciones para selectores
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([]);
  const [aniosDisponibles, setAniosDisponibles] = useState([]);

  // Datos agrupados para la gráfica de barras
  const [dataAgrupada, setDataAgrupada] = useState([]);
  // Datos para el PieChart
  const [dataPorCurso, setDataPorCurso] = useState([]);
  // Data para Ranking (Top 10 y Bottom 10)
  const [dataRankingEstudiantes, setDataRankingEstudiantes] = useState([]);

  // Declaramos el estado meta
  const [meta, setMeta] = useState(0);
  // Manejo de carga interna
  const [internalLoading, setInternalLoading] = useState(false);

  const nombreColegioLimpio = collegeName ? limpiarNombreColegio(collegeName) : "Mi Colegio";

  // 1. Actualizar opciones de filtros (Cursos, Estudiantes y Años)
  useEffect(() => {
    if (data && data.length > 0) {
      const soloEstudiantes = data.filter((d) => d.role_shortname === "student");
      const cursos = obtenerCursosFiltrados(soloEstudiantes, estudianteSeleccionado);
      setCursosDisponibles(cursos);
      if (cursoSeleccionado && !cursos.includes(cursoSeleccionado)) {
        setCursoSeleccionado("");
      }
      const estudiantes = obtenerEstudiantesFiltrados(soloEstudiantes, cursoSeleccionado);
      setEstudiantesDisponibles(estudiantes);
      const anios = Array.from(
        new Set(soloEstudiantes.map((d) => new Date(d.event_date).getFullYear().toString()))
      );
      setAniosDisponibles(anios);
    }
  }, [data, cursoSeleccionado, estudianteSeleccionado]);

  // 2. Agrupar data para la gráfica de barras (BarraActivos)
  useEffect(() => {
    if (data && data.length > 0) {
      setInternalLoading(true);
      setTimeout(() => {
        const soloEstudiantes = data.filter((d) => d.role_shortname === "student");
        let filtrados = soloEstudiantes;
        if (cursoSeleccionado) {
          filtrados = filtrados.filter((d) => d.course_fullname === cursoSeleccionado);
        }
        if (estudianteSeleccionado) {
          filtrados = filtrados.filter(
            (d) => `${d.user_fname} ${d.user_sname}` === estudianteSeleccionado
          );
        }
        // Si agrupación es "día", filtrar por rango de fechas
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
        setInternalLoading(false);
      }, 0);
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
  ]);

  // 3. Agrupar datos para el PieChart (por curso)
  useEffect(() => {
    if (data && data.length > 0) {
      const soloEstudiantes = data.filter((d) => d.role_shortname === "student");
      let filtrados = soloEstudiantes;
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
      setDataPorCurso(dataAgrupadaCursos);
    }
  }, [data, cursoSeleccionado, estudianteSeleccionado, yearSeleccionado]);

  // 4. Data para Ranking (Top 10 / Bottom 10), sin aplicar el filtro de estudiante
  useEffect(() => {
    if (data && data.length > 0) {
      const soloEstudiantes = data.filter((d) => d.role_shortname === "student");
      let filtrados = soloEstudiantes;
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
        const nombreEst = `${d.user_fname} ${d.user_sname}`;
        if (!rankingMap[nombreEst]) {
          rankingMap[nombreEst] = {
            user_fname: d.user_fname,
            user_sname: d.user_sname,
            active_seconds: 0,
            course_fullname: d.course_fullname,
          };
        }
        rankingMap[nombreEst].active_seconds += Number(d.active_seconds);
      });
      const rankingArr = Object.values(rankingMap);
      setDataRankingEstudiantes(rankingArr);
    }
  }, [data, yearSeleccionado, cursoSeleccionado]);

  // 5. Recalcular la meta según los filtros
  useEffect(() => {
    // "hayFiltros" = true si se ha seleccionado curso, estudiante o año
    const hayFiltros = !!(cursoSeleccionado || estudianteSeleccionado || yearSeleccionado);
    // Calcula la meta (según tu función calcularMeta)
    const nuevaMeta = calcularMeta({
      agrupacionModo,
      unidadTiempo,
      cursoSeleccionado,
      hayFiltros,
    });
    setMeta(nuevaMeta);
  }, [agrupacionModo, unidadTiempo, cursoSeleccionado, estudianteSeleccionado, yearSeleccionado]);

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

            {/* Si agrupación no es "día", mostrar filtro de Año */}
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
          {/* Si agrupación es "día", mostrar selectores de fecha */}
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
          <span>Distribución del tiempo por curso (Estudiantes)</span>
        </div>
        <div className="page-card-body">
          <PieCursos data={dataPorCurso} />
        </div>
      </div>

      {/* Tarjeta de Ranking */}
      <div className="page-card">
        <div className="page-card-header">
          <FaChartBar />
          <span>Ranking de Estudiantes (Top 10 y Bottom 10)</span>
        </div>
        <div className="page-card-body">
          <RankingBarrasEstudiantes data={dataRankingEstudiantes} />
        </div>
      </div>
    </div>
  );
};

export default EstudiantesPage;
