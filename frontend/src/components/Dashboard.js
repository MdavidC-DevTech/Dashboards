// src/components/Dashboard.js
import React, { useState } from "react";
import { fetchDatos } from "../services/api";
import BarraActivos from "./BarraActivos";
import LineaTiempo from "./LineaTiempo";
import PieRecuento from "./PieRecuento";

const Dashboard = () => {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener datos desde el backend
  const obtenerDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await fetchDatos();
      setDatos(data);
    } catch (err) {
      setError("Error al cargar los datos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Dashboard Dedicación</h1>
      <button onClick={obtenerDatos} style={{ marginBottom: "20px" }}>
        Obtener Datos Actuales
      </button>
      {cargando && <p>Cargando datos...</p>}
      {error && <p>{error}</p>}
      {/* Cuando existan datos, se muestran los gráficos */}
      {datos.length > 0 && (
        <div>
          <BarraActivos data={datos} />
          <LineaTiempo data={datos} />
          <PieRecuento data={datos} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
