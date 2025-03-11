// src/pages/ConteoAccesoPage.js
import React, { useState, useEffect } from "react";
import { fetchDatos } from "../services/api";
import { agruparAccesoPorRango, obtenerCursosSinDocente } from "../utils/dataUtils";
import SearchableSelect from "../components/SearchableSelect";
import StackedAcceso from "../components/StackedAcceso";

function ConteoAccesoPage() {
  const [rawData, setRawData] = useState([]);
  const [rolSeleccionado, setRolSeleccionado] = useState("todos");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [yearSeleccionado, setYearSeleccionado] = useState("");
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [dataAgrupada, setDataAgrupada] = useState([]);

  // Cargar datos al montar
  useEffect(() => {
    fetchDatos()
      .then((res) => {
        setRawData(res);
      })
      .catch((err) => console.error("Error al cargar datos:", err));
  }, []);

  // Actualizar opciones de curso
  useEffect(() => {
    if (!rawData.length) return;
    const cursos = obtenerCursosSinDocente(rawData);
    setCursosDisponibles(cursos);
    if (cursoSeleccionado && !cursos.includes(cursoSeleccionado)) {
      setCursoSeleccionado("");
    }
  }, [rawData, cursoSeleccionado]);

  // Filtrar y agrupar para el gráfico de conteo de acceso
  useEffect(() => {
    let filtrados = rawData;
    if (rolSeleccionado === "teacher") {
      filtrados = filtrados.filter((d) => d.role_shortname === "teacher");
    } else if (rolSeleccionado === "student") {
      filtrados = filtrados.filter((d) => d.role_shortname === "student");
    }
    if (cursoSeleccionado) {
      filtrados = filtrados.filter((d) => d.course_fullname === cursoSeleccionado);
    }
    const agrupados = agruparAccesoPorRango(filtrados, yearSeleccionado);
    setDataAgrupada(agrupados);
  }, [rawData, rolSeleccionado, cursoSeleccionado, yearSeleccionado]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Conteo de Acceso</h1>
      <SearchableSelect
        label="Año"
        options={Array.from(new Set(rawData.map((d) => new Date(d.event_date).getFullYear().toString())))}
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
