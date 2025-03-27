// src/components/Dashboard.js
import React, { useState } from "react";
import { fetchDatos } from "../services/api";
import BarraActivos from "./BarraActivos";
import LineaTiempo from "./LineaTiempo";
import PieRecuento from "./PieRecuento";
import ExportCSVButton from "./ExportCSVButton";
import { linearRegression, linearRegressionLine } from "simple-statistics"; // Importa simple-statistics

// Función para calcular el forecast usando regresión lineal simple
const calcularForecast = (data) => {
  // Asegúrate de que data tenga los campos 'event_date' y 'minutos_activo'
  // Convertimos las fechas a números (timestamp) y creamos los puntos [x, y]
  const points = data.map(item => [
    new Date(item.event_date).getTime(),
    item.minutos_activo
  ]);
  // Si no hay suficientes puntos, devolvemos la data sin forecast
  if (points.length < 2) return data;

  const lr = linearRegression(points);
  const predict = linearRegressionLine(lr);

  // Agregamos a cada objeto la propiedad forecast basada en su fecha
  return data.map(item => ({
    ...item,
    forecast: Math.round(predict(new Date(item.event_date).getTime()))
  }));
};

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
      // Aquí asumimos que la data viene en formato adecuado, 
      // pero debemos agregar el campo 'minutos_activo' a partir de otra propiedad si fuera necesario.
      // Por ejemplo, si 'active_seconds' existe, podemos hacer:
      const dataConMinutos = data.map(item => ({
        ...item,
        minutos_activo: Math.round(Number(item.active_seconds) / 60)
      }));

      // Calculamos el forecast y lo agregamos a la data
      const dataConForecast = calcularForecast(dataConMinutos);
      setDatos(dataConForecast);
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
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            {/* Botón para exportar CSV */}
            <ExportCSVButton data={datos} filename="datos_dashboard.csv" />
          </div>
          <BarraActivos data={datos} />
          {/* Pasamos además el target (meta), por ejemplo 240 minutos */}
          <LineaTiempo data={datos} target={240} />
          <PieRecuento data={datos} />
          {/* Botón para exportar CSV */}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
