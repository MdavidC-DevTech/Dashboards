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

function ProfesoresPage() {
  const { data, loadingData, errorData, loadData } = useContext(DataContext);
  const { internalLoading, runWithLoader } = useInternalLoader();

  // Estados para filtros
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [docenteSeleccionado, setDocenteSeleccionado] = useState("");
  const [yearSeleccionado, setYearSeleccionado] = useState("");
  const [unidadTiempo, setUnidadTiempo] = useState("minutos");
  const [agrupacionModo, setAgrupacionModo] = useState("mes");

  // Estados para opciones
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [docentesDisponibles, setDocentesDisponibles] = useState([]);
  const [aniosDisponibles, setAniosDisponibles] = useState([]);
  const [dataAgrupada, setDataAgrupada] = useState([]);

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

  // Ejecutar operaciones internas (filtrado y agrupación) usando runWithLoader
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

  // Si se están cargando datos globales
  if (loadingData) {
    return (
      <div className="loading-container">
        <h2>Cargando datos...</h2>
        <div className="loader"></div>
      </div>
    );
  }

  // Si hay error
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

  // Mientras se realizan operaciones internas, mostrar Loader
  if (internalLoading) {
    return <Loader />;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Profesores</h1>

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
              <label><FaClock /> Unidad de tiempo:</label>
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

      {/* Tarjeta de Gráfica */}
      <div className="page-card">
        <div className="page-card-header">
          <FaChartBar />
          <span>Actividad en {unidadTiempo === "horas" ? "Horas" : "Minutos"}</span>
        </div>
        <div className="page-card-body">
          <BarraActivos data={dataAgrupada} unidadTiempo={unidadTiempo} />
        </div>
      </div>
    </div>
  );
}

export default ProfesoresPage;
