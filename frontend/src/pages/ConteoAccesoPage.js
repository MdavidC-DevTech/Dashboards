// src/pages/ConteoAccesoPage.js
import React, { useContext, useState, useEffect } from "react";
import { DataContext } from "../context/DataContext";
import { agruparAccesoPorRango, obtenerCursosSinDocente } from "../utils/dataUtils";
import SearchableSelect from "../components/SearchableSelect";
import StackedAcceso from "../components/StackedAcceso";
import "../styles/pages.css";
import { FaClipboardList, FaChartBar } from "react-icons/fa";
import Loader from "../components/Loader";
import useInternalLoader from "../hooks/useInternalLoader";
import { limpiarNombreColegio } from "../utils/stringUtils";
import ExportCSVButton from "../components/ExportCSVButton";

const obtenerRangoSemanaActual = () => {
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  const diffDomingo = diaSemana === 0 ? 0 : 7 - diaSemana;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diffLunes);
  const domingo = new Date(hoy);
  domingo.setDate(hoy.getDate() + diffDomingo);
  const formatear = (fecha) => fecha.toISOString().split("T")[0];
  return { inicio: formatear(lunes), fin: formatear(domingo) };
};

const ConteoAccesoPage = () => {
  const { data, loadingData, errorData, loadData, collegeName } = useContext(DataContext);
  const { internalLoading, runWithLoader } = useInternalLoader();
  const nombreColegioLimpio = collegeName ? limpiarNombreColegio(collegeName) : "Mi Colegio";

  // Estados de filtros
  const [rolSeleccionado, setRolSeleccionado] = useState("todos");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [yearSeleccionado, setYearSeleccionado] = useState("");

  // Opciones para selectores
  const [cursosDisponibles, setCursosDisponibles] = useState([]);

  // Data agrupada para la gráfica de barras (resultado de agruparAccesoPorRango)
  const [dataAgrupada, setDataAgrupada] = useState([]);

  // Actualizar opciones de cursos basados en la data (sin docente)
  useEffect(() => {
    if (data && data.length > 0) {
      const cursos = obtenerCursosSinDocente(data);
      setCursosDisponibles(cursos);
      if (cursoSeleccionado && !cursos.includes(cursoSeleccionado)) {
        setCursoSeleccionado("");
      }
    }
  }, [data, cursoSeleccionado]);

  // Filtrar y agrupar la data para la gráfica
  useEffect(() => {
    if (data && data.length > 0) {
      runWithLoader(async () => {
        let filtrados = data;
        // Filtrar por rol si se selecciona uno
        if (rolSeleccionado === "teacher") {
          filtrados = filtrados.filter((d) => d.role_shortname === "teacher");
        } else if (rolSeleccionado === "student") {
          filtrados = filtrados.filter((d) => d.role_shortname === "student");
        }
        // Filtrar por curso si se ha seleccionado
        if (cursoSeleccionado) {
          filtrados = filtrados.filter((d) => d.course_fullname === cursoSeleccionado);
        }
        // Agrupar la data según el año (la función agruparAccesoPorRango debe encargarse de ello)
        const agrupados = agruparAccesoPorRango(filtrados, yearSeleccionado);
        setDataAgrupada(agrupados);
      });
    }
  }, [data, rolSeleccionado, cursoSeleccionado, yearSeleccionado, runWithLoader]);

  // Manejo de estados de carga y errores
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

  // Definir headers para exportar el CSV
  const csvHeaders = [
    { label: "Mes", key: "mes" },
    { label: "Sin minutos", key: "Sin minutos" },
    { label: "1 a 10 minutos", key: "1 a 10 minutos" },
    { label: "10 a 40 minutos", key: "10 a 40 minutos" },
    { label: "Más de 40 minutos", key: "más de 40 minutos" },
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">{nombreColegioLimpio} (Conteo de Acceso)</h1>

      {/* Tarjeta de Filtros */}
      <div className="page-card">
        <div className="page-card-header">
          <FaClipboardList />
          <span>Filtros</span>
        </div>
        <div className="page-card-body">
          <div className="filter-group">
            {/* Filtro de Año */}
            <div className="filter-item">
              <SearchableSelect
                label="Año"
                options={Array.from(new Set(data.map((d) => new Date(d.event_date).getFullYear().toString())))}
                value={yearSeleccionado}
                onChange={setYearSeleccionado}
              />
            </div>
            {/* Filtro de Rol */}
            <div className="filter-item">
              <label>Rol:</label>
              <select
                className="custom-select"
                value={rolSeleccionado}
                onChange={(e) => setRolSeleccionado(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="teacher">Profesores</option>
                <option value="student">Estudiantes</option>
              </select>
            </div>
            {/* Filtro de Curso */}
            <div className="filter-item">
              <SearchableSelect
                label="Curso"
                options={cursosDisponibles}
                value={cursoSeleccionado}
                onChange={setCursoSeleccionado}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botón para exportar CSV */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <ExportCSVButton
          data={dataAgrupada}
          filename="reporte_conteo.csv"
          headers={csvHeaders}
          separator=";"
        />
      </div>

      {/* Tarjeta de la gráfica */}
      <div className="page-card">
        <div className="page-card-header">
          <FaChartBar />
          <span>Accesos por Rango</span>
        </div>
        <div className="page-card-body">
          <StackedAcceso data={dataAgrupada} />
        </div>
      </div>
    </div>
  );
};

export default ConteoAccesoPage;
