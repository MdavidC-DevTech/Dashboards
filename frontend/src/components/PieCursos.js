// src/components/PieCursos.js
import React from "react";
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
// Importa d3-scale y d3-scale-chromatic
import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";

const colorScale = scaleOrdinal(schemeCategory10);

const PieCursos = ({ data }) => {
  const dataEnMinutos = data.map((curso) => ({
    name: curso.course_fullname,
    value: Math.round(curso.active_seconds / 60),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={dataEnMinutos}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
        >
          {dataEnMinutos.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colorScale(entry.name)} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} minutos`} />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieCursos;
