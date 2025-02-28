// src/pages/ProfesoresPage.js
import React, { useState, useEffect } from "react";
import { fetchDatos } from "../services/api";
import { 
  obtenerCursosFiltrados, 
  obtenerDocentesFiltrados, 
  agruparDataPorMes, 
  agruparDataPorAnio 
} from "../utils/dataUtils";
import BarraActivos from "../components/BarraActivos";
import SearchableSelect from "../components/SearchableSelect";

function ProfesoresPage() {
  const [rawData, setRawData] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [docenteSeleccionado, setDocenteSeleccionado] = useState("");
  const [yearSeleccionado, setYearSeleccionado] = useState("");
  const [unidadTiempo, setUnidadTiempo] = useState("minutos"); // "minutos" o "horas"
  const [agrupacionModo, setAgrupacionModo] = useState("mes"); // "mes" o "anio"

  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [docentesDisponibles, setDocentesDisponibles] = useState([]);
  const [aniosDisponibles, setAniosDisponibles] = useState([]);
  const [dataAgrupada, setDataAgrupada] = useState([]);

  useEffect(() => {
    fetchDatos()
      .then((data) => {
        // data es un arreglo de objetos
        const soloProfes = data.filter((d) => d.role_shortname === "teacher");
        setRawData(soloProfes);
      })
      .catch((err) => console.error("Error al cargar datos:", err));
  }, []);
  

  // Actualizar opciones de curso, docente y año
  useEffect(() => {
    if (!rawData.length) return;
    setCursosDisponibles(obtenerCursosFiltrados(rawData, docenteSeleccionado));
    if (cursoSeleccionado && !obtenerCursosFiltrados(rawData, docenteSeleccionado).includes(cursoSeleccionado)) {
      setCursoSeleccionado("");
    }
    setDocentesDisponibles(obtenerDocentesFiltrados(rawData, cursoSeleccionado));
    const anios = Array.from(new Set(rawData.map(d => new Date(d.event_date).getFullYear().toString())));
    setAniosDisponibles(anios);
  }, [rawData, cursoSeleccionado, docenteSeleccionado]);

  // Filtrar y agrupar data para el gráfico
  useEffect(() => {
    let filtrados = rawData;
    if (cursoSeleccionado) {
      filtrados = filtrados.filter(d => d.course_fullname === cursoSeleccionado);
    }
    if (docenteSeleccionado) {
      filtrados = filtrados.filter(d => d.Combinada === docenteSeleccionado);
    }
    const agrupados = agrupacionModo === "mes" 
      ? agruparDataPorMes(filtrados, yearSeleccionado, unidadTiempo)
      : agruparDataPorAnio(filtrados, yearSeleccionado, unidadTiempo);
    setDataAgrupada(agrupados);
  }, [rawData, cursoSeleccionado, docenteSeleccionado, yearSeleccionado, unidadTiempo, agrupacionModo]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Pestaña Profesores</h1>
      
      {/* Control de Unidad de Tiempo */}
      <div style={{ marginBottom: "10px" }}>
        <label>
          <b>Unidad de tiempo: </b>
          <select value={unidadTiempo} onChange={e => setUnidadTiempo(e.target.value)}>
            <option value="minutos">Minutos</option>
            <option value="horas">Horas</option>
          </select>
        </label>
      </div>

      {/* Control de Agrupación: Mes vs. Año */}
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

      {/* Filtros de Curso y Docente */}
      <SearchableSelect
        label="Curso"
        options={cursosDisponibles}
        value={cursoSeleccionado}
        onChange={setCursoSeleccionado}
      />
      <SearchableSelect
        label="Docente"
        options={docentesDisponibles}
        value={docenteSeleccionado}
        onChange={setDocenteSeleccionado}
      />

      {/* Gráfico de barras */}
      <BarraActivos data={dataAgrupada} unidadTiempo={unidadTiempo} />
    </div>
  );
}

export default ProfesoresPage;
