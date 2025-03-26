// src/components/RankingBarrasEstudiantes.js
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Tooltip personalizado para mostrar nombre, curso y minutos
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, course, minutos } = payload[0].payload;
    return (
      <div style={{ backgroundColor: "#fff", border: "1px solid #ccc", padding: "5px" }}>
        <p><strong>Estudiante:</strong> {name}</p>
        <p><strong>Curso:</strong> {course || "N/A"}</p>
        <p><strong>Minutos:</strong> {minutos}</p>
      </div>
    );
  }
  return null;
};

function RankingBarrasEstudiantes({ data }) {
  // data: [{ user_fname, user_sname, active_seconds, course_fullname }, ...]

  // Ordenamos la data de mayor a menor por active_seconds
  const sortedData = [...data].sort((a, b) => b.active_seconds - a.active_seconds);

  // Creamos un array con las propiedades que nos interesan para el gráfico
  const fullData = sortedData.map((item) => ({
    name: `${item.user_fname} ${item.user_sname}`,
    course: item.course_fullname, // <<--- Para el tooltip
    minutos: Math.round(item.active_seconds / 60),
  }));

  // Top 10
  const top10 = fullData.slice(0, 10);

  // Bottom 10 (si hay más de 10)
  // Excluimos el top 10 con slice(10), luego tomamos los últimos 10 y los invertimos
  const bottom10 = fullData.length > 10
    ? fullData.slice(10).slice(-10).reverse()
    : [];

  return (
    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
      {/* Top 10 */}
      <div style={{ flex: 1, minWidth: "400px" }}>
        <h2 style={{ textAlign: "center" }}>Top 10 Estudiantes</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={top10}
            layout="vertical"
            margin={{ top: 20, right: 20, left: 80, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="minutos" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom 10 */}
      {bottom10.length > 0 && (
        <div style={{ flex: 1, minWidth: "400px" }}>
          <h2 style={{ textAlign: "center" }}>Bottom 10 Estudiantes</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={bottom10}
              layout="vertical"
              margin={{ top: 20, right: 20, left: 80, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="minutos" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default RankingBarrasEstudiantes;
