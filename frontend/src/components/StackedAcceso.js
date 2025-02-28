// src/components/StackedAcceso.js
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
  LabelList,
} from "recharts";

function StackedAcceso({ data }) {
  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Accesos Mensuales por Clasificación</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Sin minutos" stackId="rango" fill="#8884d8">
            <LabelList dataKey="Sin minutos" position="top" />
          </Bar>
          <Bar dataKey="1 a 10 minutos" stackId="rango" fill="#82ca9d">
            <LabelList dataKey="1 a 10 minutos" position="top" />
          </Bar>
          <Bar dataKey="10 a 40 minutos" stackId="rango" fill="#ffc658">
            <LabelList dataKey="10 a 40 minutos" position="top" />
          </Bar>
          <Bar dataKey="más de 40 minutos" stackId="rango" fill="#d0ed57">
            <LabelList dataKey="más de 40 minutos" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StackedAcceso;
