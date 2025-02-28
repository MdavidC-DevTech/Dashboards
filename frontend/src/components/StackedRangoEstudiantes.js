// src/components/StackedRangoEstudiantes.js
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

function StackedRangoEstudiantes({ data }) {
  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Distribución de Estudiantes por Rango</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
}

export default StackedRangoEstudiantes;
