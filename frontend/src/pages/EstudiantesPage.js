// src/pages/EstudiantesPage.js
import React, { useContext, useState, useEffect } from "react";
import { DataContext } from "../context/DataContext";
import {
  obtenerCursosFiltrados,
  agruparDataPorMes,
  agruparDataPorAnio,
} from "../utils/dataUtils";
import SearchableSelect from "../components/SearchableSelect";
import BarraActivos from "../components/BarraActivos";
import "../styles/pages.css"; // Estilos globales
import { FaUserGraduate, FaChartBar, FaClock } from "react-icons/fa";
import Loader from "../components/Loader";

function EstudiantesPage() {
  const { data, loadingData, errorData, loadData } = useContext(DataContext);

  // Estados para filtros
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
  
  // Estado para indicar carga interna (operaciones de filtrado/agrupación)
  const [internalLoading, setInternalLoading] = useState(false);

  // Actualizar opciones de filtros (cursos, estudiantes, años)
  useEffect(() => {
    if (data && data.length > 0) {
      const soloEstudiantes = data.filter((d) => d.role_shortname === "student");

      // Cursos disponibles
      const cursos = obtenerCursosFiltrados(soloEstudiantes, estudianteSeleccionado);
      setCursosDisponibles(cursos);
      if (cursoSeleccionado && !cursos.includes(cursoSeleccionado)) {
        setCursoSeleccionado("");
      }

      // Estudiantes disponibles
      const estudiantes = Array.from(
        new Set(soloEstudiantes.map((d) => `${d.user_fname} ${d.user_sname}`))
      );
      setEstudiantesDisponibles(estudiantes);

      // Años disponibles
      const anios = Array.from(
        new Set(
          soloEstudiantes.map((d) =>
            new Date(d.event_date).getFullYear().toString()
          )
        )
      );
      setAniosDisponibles(anios);
    }
  }, [data, cursoSeleccionado, estudianteSeleccionado]);

  // Agrupar y filtrar la data para la gráfica
  useEffect(() => {
    if (data && data.length > 0) {
      // Indicar que se están realizando operaciones internas
      setInternalLoading(true);

      // Usamos setTimeout para "desacoplar" la operación y permitir la actualización del estado
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

  // Mostrar loader global si se está cargando datos desde el DataContext
  if (loadingData) {
    return (
      <div className="loading-container">
        <h2>Cargando datos...</h2>
        <div className="loader"></div>
      </div>
    );
  }

  // Manejo de error
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

  // Mientras se realizan operaciones internas, mostrar el loader (overlay o en lugar de la interfaz)
  if (internalLoading) {
    return <Loader />;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Pestaña Estudiantes</h1>

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

export default EstudiantesPage;
