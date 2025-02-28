// src/components/StackedRangoBarras.js
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Supongamos que "recuento_activo" tiene valores como "1 a 10 minutos", "10 a 40 minutos", "más de 40 minutos".
// Para un stacked bar, a veces conviene agrupar la data por mes y contar cuántos estudiantes hay en cada rango.

const StackedRangoBarras = ({ data }) => {
  // Ejemplo: agrupar por mes y por rango
  // OJO: Debes tener un mes extraído, p. ej. "Mes" o agrupar con tu utils

  // 1) Creamos un objeto para agrupar { mes: { "1 a 10 minutos": X, "10 a 40 minutos": Y, ... }, ... }
  const agrupado = {};
  data.forEach((item) => {
    // Suponiendo que ya tienes "Mes" o algo similar
    const mes = item.event_date; // O extrae el mes de la fecha
    const rango = item.recuento_activo;
    if (!agrupado[mes]) {
      agrupado[mes] = { mes, "Sin minutos": 0, "1 a 10 minutos": 0, "10 a 40 minutos": 0, "más de 40 minutos": 0 };
    }
    agrupado[mes][rango] = (agrupado[mes][rango] || 0) + 1;
  });

  // 2) Convertir agrupado en array
  const dataFinal = Object.values(agrupado);

  return (
    <div>
      <h2>Distribución por Rango de Minutos</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dataFinal}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Sin minutos" stackId="rango" fill="#8884d8" />
          <Bar dataKey="1 a 10 minutos" stackId="rango" fill="#82ca9d" />
          <Bar dataKey="10 a 40 minutos" stackId="rango" fill="#ffc658" />
          <Bar dataKey="más de 40 minutos" stackId="rango" fill="#d0ed57" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StackedRangoBarras;
