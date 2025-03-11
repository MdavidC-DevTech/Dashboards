// src/pages/EstudiantesPage.js
import React, { useState, useEffect } from "react";
import { fetchDatos } from "../services/api";
import {
  obtenerCursosFiltrados,
  agruparDataPorMes,
  agruparDataPorAnio,
} from "../utils/dataUtils";
import SearchableSelect from "../components/SearchableSelect";
import BarraActivos from "../components/BarraActivos";

function EstudiantesPage() {
  const [rawData, setRawData] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState("");
  const [yearSeleccionado, setYearSeleccionado] = useState("");
  const [unidadTiempo, setUnidadTiempo] = useState("minutos");
  const [agrupacionModo, setAgrupacionModo] = useState("mes");

  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([]);
  const [aniosDisponibles, setAniosDisponibles] = useState([]);
  const [dataAgrupada, setDataAgrupada] = useState([]);

  // Cargar datos al montar
  useEffect(() => {
    fetchDatos()
      .then((data) => {
        const soloEstudiantes = data.filter((d) => d.role_shortname === "student");
        setRawData(soloEstudiantes);
      })
      .catch((err) => console.error("Error al cargar datos:", err));
  }, []);

  // Actualizar opciones de filtros basados en rawData
  useEffect(() => {
    if (!rawData.length) return;
    setCursosDisponibles(obtenerCursosFiltrados(rawData, estudianteSeleccionado));
    if (cursoSeleccionado && !obtenerCursosFiltrados(rawData, estudianteSeleccionado).includes(cursoSeleccionado)) {
      setCursoSeleccionado("");
    }
    // Combina user_fname y user_sname para estudiantes
    const estudiantes = Array.from(new Set(rawData.map((d) => `${d.user_fname} ${d.user_sname}`)));
    setEstudiantesDisponibles(estudiantes);
    const anios = Array.from(
      new Set(rawData.map((d) => new Date(d.event_date).getFullYear().toString()))
    );
    setAniosDisponibles(anios);
  }, [rawData, cursoSeleccionado, estudianteSeleccionado]);

  // Filtrar y agrupar data para el gráfico
  useEffect(() => {
    let filtrados = rawData;
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
  }, [rawData, cursoSeleccionado, estudianteSeleccionado, yearSeleccionado, unidadTiempo, agrupacionModo]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Pestaña Estudiantes</h1>
      
      {/* Control de Unidad de Tiempo */}
      <div style={{ marginBottom: "10px" }}>
        <label>
          <b>Unidad de tiempo: </b>
          <select value={unidadTiempo} onChange={(e) => setUnidadTiempo(e.target.value)}>
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
          /> Mes
        </label>
        <label style={{ marginLeft: "10px" }}>
          <input
            type="radio"
            name="agrupacion"
            value="anio"
            checked={agrupacionModo === "anio"}
            onChange={() => setAgrupacionModo("anio")}
          /> Año
        </label>
      </div>
      
      {/* Filtro de Año */}
      <SearchableSelect
        label="Año"
        options={aniosDisponibles}
        value={yearSeleccionado}
        onChange={setYearSeleccionado}
      />
      
      {/* Filtros de Curso y Estudiante */}
      <SearchableSelect
        label="Curso"
        options={cursosDisponibles}
        value={cursoSeleccionado}
        onChange={setCursoSeleccionado}
      />
      <SearchableSelect
        label="Estudiante"
        options={estudiantesDisponibles}
        value={estudianteSeleccionado}
        onChange={setEstudianteSeleccionado}
      />
      
      {/* Gráfico de barras */}
      <BarraActivos data={dataAgrupada} unidadTiempo={unidadTiempo} />
    </div>
  );
}

export default EstudiantesPage;
