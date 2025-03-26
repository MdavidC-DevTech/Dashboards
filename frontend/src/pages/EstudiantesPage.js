// src/pages/EstudiantesPage.js

import React, { useContext, useState, useEffect } from "react";
import { DataContext } from "../context/DataContext";
import {
  obtenerCursosFiltrados,
  agruparDataPorMes,
  agruparDataPorAnio,
  obtenerEstudiantesFiltrados,
} from "../utils/dataUtils";
import SearchableSelect from "../components/SearchableSelect";
import BarraActivos from "../components/BarraActivos";
import "../styles/pages.css"; // Estilos globales
import { FaUserGraduate, FaChartBar, FaClock } from "react-icons/fa";
import Loader from "../components/Loader";
import { limpiarNombreColegio } from "../utils/stringUtils";
import PieCursos from "../components/PieCursos";
import RankingBarrasEstudiantes from "../components/RankingBarrasEstudiantes";

function EstudiantesPage() {
  const { data, loadingData, errorData, loadData, collegeName } = useContext(DataContext);

  // Filtros
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState("");
  const [yearSeleccionado, setYearSeleccionado] = useState("");
  const [unidadTiempo, setUnidadTiempo] = useState("minutos");
  const [agrupacionModo, setAgrupacionModo] = useState("mes");

  // Estados para opciones y data agrupada
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([]);
  const [aniosDisponibles, setAniosDisponibles] = useState([]);
  const [dataAgrupada, setDataAgrupada] = useState([]);

  // Para el gráfico de pastel por curso
  const [dataPorCurso, setDataPorCurso] = useState([]);



  // **Nuevo**: Ranking que ignora el filtro de "estudianteSeleccionado"
  const [dataRankingEstudiantes, setDataRankingEstudiantes] = useState([]);

  // Manejo de carga interna
  const [internalLoading, setInternalLoading] = useState(false);

  const nombreColegioLimpio = collegeName ? limpiarNombreColegio(collegeName) : "Mi Colegio";

  // 1. Actualizar opciones de filtros (cursos, estudiantes, años)
  useEffect(() => {
    if (data && data.length > 0) {
      const soloEstudiantes = data.filter((d) => d.role_shortname === "student");

      // Cursos según el estudiante seleccionado
      const cursos = obtenerCursosFiltrados(soloEstudiantes, estudianteSeleccionado);
      setCursosDisponibles(cursos);
      if (cursoSeleccionado && !cursos.includes(cursoSeleccionado)) {
        setCursoSeleccionado("");
      }

      // Estudiantes según el curso seleccionado
      const estudiantes = obtenerEstudiantesFiltrados(soloEstudiantes, cursoSeleccionado);
      setEstudiantesDisponibles(estudiantes);

      // Años disponibles
      const anios = Array.from(
        new Set(soloEstudiantes.map((d) => new Date(d.event_date).getFullYear().toString()))
      );
      setAniosDisponibles(anios);
    }
  }, [data, cursoSeleccionado, estudianteSeleccionado]);

  // 2. Agrupar y filtrar la data para la gráfica de barras (BarraActivos)
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

        const agrupados =
          agrupacionModo === "mes"
            ? agruparDataPorMes(filtrados, yearSeleccionado, unidadTiempo)
            : agruparDataPorAnio(filtrados, yearSeleccionado, unidadTiempo);

        setDataAgrupada(agrupados);
        setInternalLoading(false);
      }, 0);
    }
  }, [data, cursoSeleccionado, estudianteSeleccionado, yearSeleccionado, unidadTiempo, agrupacionModo]);

  // 3. Gráfico Pie por curso (filtra por curso y estudiante)
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

  

  // 5. **Nuevo**: Data para Ranking que ignora el filtro de "estudianteSeleccionado"
  useEffect(() => {
    if (data && data.length > 0) {
      const soloEstudiantes = data.filter((d) => d.role_shortname === "student");
      let filtrados = soloEstudiantes;

      // Aplicar SOLO el filtro de año y curso, NO el de estudiante
      if (yearSeleccionado) {
        filtrados = filtrados.filter(
          (d) => new Date(d.event_date).getFullYear().toString() === yearSeleccionado
        );
      }
      if (cursoSeleccionado) {
        filtrados = filtrados.filter((d) => d.course_fullname === cursoSeleccionado);
      }

      // Sumar active_seconds por estudiante
      const rankingMap = {};
      filtrados.forEach((d) => {
        const nombreEst = `${d.user_fname} ${d.user_sname}`;
        if (!rankingMap[nombreEst]) {
          rankingMap[nombreEst] = {
            user_fname: d.user_fname,
            user_sname: d.user_sname,
            active_seconds: 0,
            course_fullname: d.course_fullname, // Guardamos el curso para el tooltip
          };
        }
        rankingMap[nombreEst].active_seconds += Number(d.active_seconds);
      });

      const rankingArr = Object.values(rankingMap);
      setDataRankingEstudiantes(rankingArr);
    }
  }, [data, yearSeleccionado, cursoSeleccionado]); 
  // NOTA: NO incluimos "estudianteSeleccionado" aquí.

  // Manejo de carga global
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
        </div>
      </div>

      {/* Tarjeta de Gráfica de Barras (BarraActivos) */}
      <div className="page-card">
        <div className="page-card-header">
          <FaChartBar />
          <span>Actividad en {unidadTiempo === "horas" ? "Horas" : "Minutos"}</span>
        </div>
        <div className="page-card-body">
          <BarraActivos data={dataAgrupada} unidadTiempo={unidadTiempo} />
        </div>
      </div>

      {/* Gráfico Pie por curso */}
      <div className="page-card">
        <div className="page-card-header">
          <FaChartBar />
          <span>Distribución del tiempo por curso</span>
        </div>
        <div className="page-card-body">
          <PieCursos data={dataPorCurso} />
        </div>
      </div>

      {/* Ranking Top 10 / Bottom 10 que ignora estudianteSeleccionado */}
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
}

export default EstudiantesPage;
