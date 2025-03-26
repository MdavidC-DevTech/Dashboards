// src/components/PieEstudiantes.js
import React from "react";
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";

const colorScale = scaleOrdinal(schemeCategory10);

// Cantidad de estudiantes que queremos mostrar como "Top N"
const TOP_N = 10;

// Tooltip personalizado
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, course, value } = payload[0].payload;

    // Si el slice corresponde a "Otros", no mostramos "Curso"
    if (name === "Otros") {
      return (
        <div style={{ background: "#fff", border: "1px solid #ccc", padding: "5px" }}>
          <p><strong>{name}</strong></p>
          <p><strong>Tiempo:</strong> {value} minutos</p>
        </div>
      );
    }

    return (
      <div style={{ background: "#fff", border: "1px solid #ccc", padding: "5px" }}>
        <p><strong>Estudiante:</strong> {name}</p>
        <p><strong>Curso:</strong> {course}</p>
        <p><strong>Tiempo:</strong> {value} minutos</p>
      </div>
    );
  }
  return null;
};

const PieEstudiantes = ({ data }) => {
  // 1) Transformar la data para obtener nombre, curso y valor (en minutos)
  const dataEnMinutos = data.map((estudiante) => ({
    name: `${estudiante.user_fname} ${estudiante.user_sname}`,
    course: estudiante.course_fullname,
    value: Math.round(estudiante.active_seconds / 60),
  }));

  // 2) Ordenar la data de mayor a menor tiempo
  dataEnMinutos.sort((a, b) => b.value - a.value);

  // 3) Dividir en Top N y agrupar el resto como "Otros"
  const topN = dataEnMinutos.slice(0, TOP_N);
  const resto = dataEnMinutos.slice(TOP_N);

  if (resto.length > 0) {
    // Sumar el valor del resto
    const totalOtros = resto.reduce((acum, curr) => acum + curr.value, 0);
    // Agregar un slice "Otros"
    topN.push({
      name: "Otros",
      course: "",
      value: totalOtros,
    });
  }

  // 4) Renderizar el gráfico Pie usando solo la data topN
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={topN}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
        >
          {topN.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colorScale(entry.name)} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieEstudiantes;
