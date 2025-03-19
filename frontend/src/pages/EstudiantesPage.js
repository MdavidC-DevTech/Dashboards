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

function EstudiantesPage() {
  const { data, loadingData } = useContext(DataContext);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState("");
  const [yearSeleccionado, setYearSeleccionado] = useState("");
  const [unidadTiempo, setUnidadTiempo] = useState("minutos");
  const [agrupacionModo, setAgrupacionModo] = useState("mes");

  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([]);
  const [aniosDisponibles, setAniosDisponibles] = useState([]);
  const [dataAgrupada, setDataAgrupada] = useState([]);

  // Actualizar opciones de filtros basados en la data para estudiantes
  useEffect(() => {
    if (data && data.length > 0) {
      const soloEstudiantes = data.filter((d) => d.role_shortname === "student");
      const cursos = obtenerCursosFiltrados(soloEstudiantes, estudianteSeleccionado);
      setCursosDisponibles(cursos);
      if (cursoSeleccionado && !cursos.includes(cursoSeleccionado)) {
        setCursoSeleccionado("");
      }
      const estudiantes = Array.from(
        new Set(soloEstudiantes.map((d) => `${d.user_fname} ${d.user_sname}`))
      );
      setEstudiantesDisponibles(estudiantes);
      const anios = Array.from(
        new Set(soloEstudiantes.map((d) => new Date(d.event_date).getFullYear().toString()))
      );
      setAniosDisponibles(anios);
    }
  }, [data, cursoSeleccionado, estudianteSeleccionado]);

  // Filtrar y agrupar la data para el gráfico
  useEffect(() => {
    if (data && data.length > 0) {
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
    }
  }, [data, cursoSeleccionado, estudianteSeleccionado, yearSeleccionado, unidadTiempo, agrupacionModo]);

  if (loadingData) {
    return <div>Cargando datos...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Pestaña Estudiantes</h1>
      <div style={{ marginBottom: "10px" }}>
        <label>
          <b>Unidad de tiempo: </b>
          <select value={unidadTiempo} onChange={(e) => setUnidadTiempo(e.target.value)}>
            <option value="minutos">Minutos</option>
            <option value="horas">Horas</option>
          </select>
        </label>
      </div>
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
      <SearchableSelect
        label="Año"
        options={aniosDisponibles}
        value={yearSeleccionado}
        onChange={setYearSeleccionado}
      />
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
      <BarraActivos data={dataAgrupada} unidadTiempo={unidadTiempo} />
    </div>
  );
}

export default EstudiantesPage;
