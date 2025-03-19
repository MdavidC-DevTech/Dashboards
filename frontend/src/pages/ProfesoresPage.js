// src/pages/ProfesoresPage.js
import React, { useContext, useState, useEffect } from "react";
import { DataContext } from "../context/DataContext";
import { 
  obtenerCursosFiltrados, 
  obtenerDocentesFiltrados, 
  agruparDataPorMes, 
  agruparDataPorAnio 
} from "../utils/dataUtils";
import BarraActivos from "../components/BarraActivos";
import SearchableSelect from "../components/SearchableSelect";

function ProfesoresPage() {
  const { data } = useContext(DataContext);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [docenteSeleccionado, setDocenteSeleccionado] = useState("");
  const [yearSeleccionado, setYearSeleccionado] = useState("");
  const [unidadTiempo, setUnidadTiempo] = useState("minutos");
  const [agrupacionModo, setAgrupacionModo] = useState("mes");

  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [docentesDisponibles, setDocentesDisponibles] = useState([]);
  const [aniosDisponibles, setAniosDisponibles] = useState([]);
  const [dataAgrupada, setDataAgrupada] = useState([]);

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
      const anios = Array.from(new Set(soloProfes.map((d) => new Date(d.event_date).getFullYear().toString())));
      setAniosDisponibles(anios);
    }
  }, [data, cursoSeleccionado, docenteSeleccionado]);

  useEffect(() => {
    if (data && data.length > 0) {
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
      const agrupados = agrupacionModo === "mes"
        ? agruparDataPorMes(filtrados, yearSeleccionado, unidadTiempo)
        : agruparDataPorAnio(filtrados, yearSeleccionado, unidadTiempo);
      setDataAgrupada(agrupados);
    }
  }, [data, cursoSeleccionado, docenteSeleccionado, yearSeleccionado, unidadTiempo, agrupacionModo]);


  return (
    <div className="container" style={{ padding: "20px" }}>
    <div style={{ padding: "20px" }}>
      
      <h1>Pestaña Profesores</h1>
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
          <input type="radio" name="agrupacion" value="mes" checked={agrupacionModo === "mes"} onChange={() => setAgrupacionModo("mes")} /> Mes
        </label>
        <label style={{ marginLeft: "10px" }}>
          <input type="radio" name="agrupacion" value="anio" checked={agrupacionModo === "anio"} onChange={() => setAgrupacionModo("anio")} /> Año
        </label>
      </div>
      <SearchableSelect label="Año" options={aniosDisponibles} value={yearSeleccionado} onChange={setYearSeleccionado} />
      <SearchableSelect label="Curso" options={cursosDisponibles} value={cursoSeleccionado} onChange={setCursoSeleccionado} />
      <SearchableSelect label="Docente" options={docentesDisponibles} value={docenteSeleccionado} onChange={setDocenteSeleccionado} />
      <BarraActivos data={dataAgrupada} unidadTiempo={unidadTiempo} />
      </div>
    </div>
  );
}

export default ProfesoresPage;
