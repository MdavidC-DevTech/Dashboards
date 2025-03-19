import React, { useContext, useState, useEffect } from "react";
import { DataContext } from "../context/DataContext";
import { agruparAccesoPorRango, obtenerCursosSinDocente } from "../utils/dataUtils";
import SearchableSelect from "../components/SearchableSelect";
import StackedAcceso from "../components/StackedAcceso";

function ConteoAccesoPage() {
  // Obtenemos la data y el estado de carga desde DataContext
  const { data, loadingData } = useContext(DataContext);

  // Estados locales para filtros
  const [rolSeleccionado, setRolSeleccionado] = useState("todos");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [yearSeleccionado, setYearSeleccionado] = useState("");
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [dataAgrupada, setDataAgrupada] = useState([]);

  // Actualizar opciones de cursos basados en la data disponible
  useEffect(() => {
    if (!data.length) return;
    const cursos = obtenerCursosSinDocente(data);
    setCursosDisponibles(cursos);
    // Reiniciamos el curso seleccionado si ya no está en las opciones
    if (cursoSeleccionado && !cursos.includes(cursoSeleccionado)) {
      setCursoSeleccionado("");
    }
  }, [data, cursoSeleccionado]);

  // Filtrar y agrupar la data para el gráfico
  useEffect(() => {
    if (!data.length) return;
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
  }, [data, rolSeleccionado, cursoSeleccionado, yearSeleccionado]);

  // Si aún se cargan los datos, mostramos un loader
  if (loadingData) {
    return <div>Cargando datos...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Conteo de Acceso</h1>
      <SearchableSelect
        label="Año"
        options={Array.from(new Set(data.map((d) => new Date(d.event_date).getFullYear().toString())))}
        value={yearSeleccionado}
        onChange={setYearSeleccionado}
      />
      <div style={{ marginTop: "10px" }}>
        <label>
          <b>Rol: </b>
          <select
            value={rolSeleccionado}
            onChange={(e) => setRolSeleccionado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="teacher">Profesores</option>
            <option value="student">Estudiantes</option>
          </select>
        </label>
      </div>
      <SearchableSelect
        label="Curso"
        options={cursosDisponibles}
        value={cursoSeleccionado}
        onChange={setCursoSeleccionado}
      />
      <StackedAcceso data={dataAgrupada} />
    </div>
  );
}

export default ConteoAccesoPage;
