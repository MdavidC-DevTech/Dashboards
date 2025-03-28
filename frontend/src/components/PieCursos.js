// src/components/PieCursos.js
import React, { useEffect } from "react";
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";

const colorScale = scaleOrdinal(schemeCategory10);

const PieCursos = ({ data, onPieDataChange }) => {
  // "data" viene como [{ course_fullname, active_seconds }, ...]

  // 1) Transformar a [{ name, value }] con minutos
  const dataEnMinutos = data.map((curso) => ({
    name: curso.course_fullname,
    value: Math.round(curso.active_seconds / 60),
  }));

  // 2) Calcular % real
  const total = dataEnMinutos.reduce((acc, cur) => acc + cur.value, 0);
  const finalWithPct = dataEnMinutos.map((item) => {
    const pct = total === 0 ? 0 : (item.value / total) * 100;
    return {
      ...item, 
      percentage: Number(pct.toFixed(1))  // 1 decimal
    };
  });

  // 3) En cada render (o con un useEffect para no spamear), avisamos al padre
  useEffect(() => {
    if (typeof onPieDataChange === "function") {
      onPieDataChange(finalWithPct);
    }
    // Sólo cuando cambie 'data'
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

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
