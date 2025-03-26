// src/pages/ConteoAccesoPage.js
import React, { useContext, useState, useEffect } from "react";
import { DataContext } from "../context/DataContext";
import { agruparAccesoPorRango, obtenerCursosSinDocente } from "../utils/dataUtils";
import SearchableSelect from "../components/SearchableSelect";
import StackedAcceso from "../components/StackedAcceso";
import "../styles/pages.css"; // Usamos la hoja de estilos global para páginas
import { FaClipboardList, FaChartBar } from "react-icons/fa";
import Loader from "../components/Loader";
import useInternalLoader from "../hooks/useInternalLoader";
//import { AuthContext } from "../context/AuthContext";
import { limpiarNombreColegio } from "../utils/stringUtils";


function ConteoAccesoPage() {
  // Extraemos data, loadingData, errorData y loadData del DataContext
  const { data, loadingData, errorData, loadData, collegeName } = useContext(DataContext);
  // Usamos el hook personalizado para operaciones internas
  const { internalLoading, runWithLoader } = useInternalLoader();
  //para sacar datos del usuario logeado
  // const { currentUser } = useContext(AuthContext);

  // Estados para filtros
  const [rolSeleccionado, setRolSeleccionado] = useState("todos");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [yearSeleccionado, setYearSeleccionado] = useState("");

  // Estado para opciones y data agrupada
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [dataAgrupada, setDataAgrupada] = useState([]);

  // Aplica la transformación al nombre del colegio
  const nombreColegioLimpio = collegeName ? limpiarNombreColegio(collegeName) : "Mi Colegio";


  // Actualizar opciones de cursos basados en la data
  useEffect(() => {
    if (!data.length) return;
    const cursos = obtenerCursosSinDocente(data);
    setCursosDisponibles(cursos);
    // Si el curso seleccionado ya no está en la lista, se resetea
    if (cursoSeleccionado && !cursos.includes(cursoSeleccionado)) {
      setCursoSeleccionado("");
    }
  }, [data, cursoSeleccionado]);

  // Filtrar y agrupar la data para la gráfica utilizando el hook para manejar la carga interna
  useEffect(() => {
    if (!data.length) return;
    runWithLoader(async () => {
      let filtrados = data;
      // Filtrar por rol
      if (rolSeleccionado === "teacher") {
        filtrados = filtrados.filter((d) => d.role_shortname === "teacher");
      } else if (rolSeleccionado === "student") {
        filtrados = filtrados.filter((d) => d.role_shortname === "student");
      }
      // Filtrar por curso si se ha seleccionado alguno
      if (cursoSeleccionado) {
        filtrados = filtrados.filter((d) => d.course_fullname === cursoSeleccionado);
      }
      // Agrupar la data según el año y otros parámetros
      const agrupados = agruparAccesoPorRango(filtrados, yearSeleccionado);
      setDataAgrupada(agrupados);
    });
  }, [data, rolSeleccionado, cursoSeleccionado, yearSeleccionado, runWithLoader]);

  // Si se están cargando los datos globales
  if (loadingData) {
    return (
      <div className="loading-container">
        <h2>Cargando datos...</h2>
        <div className="loader"></div>
      </div>
    );
  }

  // Manejo de errores
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

  // Mientras se realizan operaciones internas, mostramos el Loader (con el mismo CSS de Loader.js)
  if (internalLoading) {
    return <Loader />;
  }

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
                options={Array.from(
                  new Set(
                    data.map((d) =>
                      new Date(d.event_date).getFullYear().toString()
                    )
                  )
                )}
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

      {/* Tarjeta con la gráfica */}
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
}

export default ConteoAccesoPage;
