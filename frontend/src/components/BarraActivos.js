// src/components/BarraActivos.js
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

// Tooltip personalizado (opcional)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "#fff", border: "1px solid #ccc", padding: "5px" }}>
        <p><strong>{label}</strong></p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function BarraActivos({ data, unidadTiempo }) {
  const meta = unidadTiempo === "minutos" ? 240 : 4;

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Actividad en {unidadTiempo === "minutos" ? "Minutos" : "Horas"}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine
            y={meta}
            stroke="red"
            label={{ value: `Meta: ${meta} ${unidadTiempo}`, position: "insideTopRight", fill: "red" }}
          />
          <Bar dataKey="total" fill="#8884d8" name={`Total ${unidadTiempo}`}>
            <LabelList dataKey="total" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarraActivos;
