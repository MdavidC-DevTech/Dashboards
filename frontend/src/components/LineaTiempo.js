// src/components/LineaTiempo.js
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const LineaTiempo = ({ data }) => {
  return (
    <div>
      <h2>Evolución de Minutos Activo en el Tiempo</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="event_date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="minutos_activo" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineaTiempo;
