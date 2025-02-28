import React, { useState, useEffect } from "react";
import { fetchDatos } from "../services/api";
import {
  obtenerCursosFiltrados,
  agruparDataPorMes,
  agruparDataPorAnio
} from "../utils/dataUtils";
import SearchableSelect from "../components/SearchableSelect";
import BarraActivos from "../components/BarraActivos";

function EstudiantesPage() {
  // Estado para la data completa de estudiantes
  const [rawData, setRawData] = useState([]);
  // Filtros para curso, estudiante y año
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState("");
  const [yearSeleccionado, setYearSeleccionado] = useState("");
  // Control de unidad de tiempo: minutos o horas
  const [unidadTiempo, setUnidadTiempo] = useState("minutos");
  // Control de agrupación: por mes o por año
  const [agrupacionModo, setAgrupacionModo] = useState("mes");

  // Opciones disponibles para los filtros
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([]);
  const [aniosDisponibles, setAniosDisponibles] = useState([]);

  // Data agrupada para la gráfica
  const [dataAgrupada, setDataAgrupada] = useState([]);

  // 1. Cargar la data desde el backend y filtrar solo para estudiantes
  useEffect(() => {
    fetchDatos().then((res) => {
      const soloEstudiantes = res.filter(d => d.role_shortname === "student");
      setRawData(soloEstudiantes);
    });
  }, []);

  // 2. Actualizar las opciones de curso, estudiante y año según la data cruda
  useEffect(() => {
    if (!rawData.length) return;
    // Opciones de curso basadas en la data, usando el filtro de estudiante si se selecciona
    setCursosDisponibles(obtenerCursosFiltrados(rawData, estudianteSeleccionado));
    // Si el curso seleccionado ya no está en las opciones, se resetea
    if (cursoSeleccionado && !obtenerCursosFiltrados(rawData, estudianteSeleccionado).includes(cursoSeleccionado)) {
      setCursoSeleccionado("");
    }
    // Opciones de estudiantes: usamos la misma función que para docentes, ya que la propiedad de nombre es "Combinada"
    // Aquí mostramos todos los nombres de estudiantes
    const estudiantes = Array.from(new Set(rawData.map(d => d.Combinada)));
    setEstudiantesDisponibles(estudiantes);
    // Opciones de año
    const anios = Array.from(new Set(rawData.map(d => new Date(d.event_date).getFullYear().toString())));
    setAniosDisponibles(anios);
  }, [rawData, cursoSeleccionado, estudianteSeleccionado]);

  // 3. Filtrar la data y agruparla según la selección de año, curso, estudiante, unidad y agrupación
  useEffect(() => {
    let filtrados = rawData;
    if (cursoSeleccionado) {
      filtrados = filtrados.filter(d => d.course_fullname === cursoSeleccionado);
    }
    if (estudianteSeleccionado) {
      filtrados = filtrados.filter(d => d.Combinada === estudianteSeleccionado);
    }
    // Agrupar según el modo: por mes o por año.
    const agrupados = agrupacionModo === "mes"
      ? agruparDataPorMes(filtrados, yearSeleccionado, unidadTiempo)
      : agruparDataPorAnio(filtrados, yearSeleccionado, unidadTiempo);
    setDataAgrupada(agrupados);
  }, [rawData, cursoSeleccionado, estudianteSeleccionado, yearSeleccionado, unidadTiempo, agrupacionModo]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Pestaña Estudiantes</h1>
      
      {/* Control para la unidad de tiempo */}
      <div style={{ marginBottom: "10px" }}>
        <label>
          <b>Unidad de tiempo: </b>
          <select value={unidadTiempo} onChange={e => setUnidadTiempo(e.target.value)}>
            <option value="minutos">Minutos</option>
            <option value="horas">Horas</option>
          </select>
        </label>
      </div>

      {/* Control para la agrupación: Mes vs. Año */}
      <div style={{ marginBottom: "10px" }}>
        <label>
          <b>Agrupar por: </b>
          <input
            type="radio"
            name="agrupacion"
            value="mes"
            checked={agrupacionModo === "mes"}
            onChange={() => setAgrupacionModo("mes")}
          />{" "}
          Mes
        </label>
        <label style={{ marginLeft: "10px" }}>
          <input
            type="radio"
            name="agrupacion"
            value="anio"
            checked={agrupacionModo === "anio"}
            onChange={() => setAgrupacionModo("anio")}
          />{" "}
          Año
        </label>
      </div>

      {/* Filtro de Año */}
      <SearchableSelect
        label="Año"
        options={aniosDisponibles}
        value={yearSeleccionado}
        onChange={setYearSeleccionado}
      />

      {/* Filtro de Curso */}
      <SearchableSelect
        label="Curso"
        options={cursosDisponibles}
        value={cursoSeleccionado}
        onChange={setCursoSeleccionado}
      />

      {/* Filtro de Estudiante */}
      <SearchableSelect
        label="Estudiante"
        options={estudiantesDisponibles}
        value={estudianteSeleccionado}
        onChange={setEstudianteSeleccionado}
      />

      {/* Gráfico de barras (igual que en Profesores) */}
      <BarraActivos data={dataAgrupada} unidadTiempo={unidadTiempo} />
    </div>
  );
}

export default EstudiantesPage;
