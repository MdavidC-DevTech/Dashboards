// src/components/ConteoAccesoBarras.js
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ConteoAccesoBarras = ({ data }) => {
  return (
    <div>
      <h2>Accesos Mensuales (Profes vs. Estudiantes)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="teacher" stackId="rol" fill="#8884d8" />
          <Bar dataKey="student" stackId="rol" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConteoAccesoBarras;
