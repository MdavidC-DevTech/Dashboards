// src/components/LineaTiempo.js
import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ReferenceLine 
} from "recharts";

const LineaTiempo = ({ data, target }) => {
  return (
    <div>
      <h2>Evolución de Minutos Activo en el Tiempo</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="event_date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {/* Línea de la actividad real */}
          <Line 
            type="monotone" 
            dataKey="minutos_activo" 
            stroke="#82ca9d" 
            name="Minutos Activo" 
          />
          {/* Línea de pronóstico (se dibuja si existe el campo 'forecast') */}
          {data[0] && data[0].forecast !== undefined && (
            <Line 
              type="monotone" 
              dataKey="forecast" 
              stroke="#FF0000" 
              name="Pronóstico" 
              strokeDasharray="5 5" 
            />
          )}
          {/* Línea de meta */}
          {target && (
            <ReferenceLine 
              y={target} 
              label={{ value: `Meta: ${target}`, position: "insideTopRight", fill: "red" }} 
              stroke="red" 
              strokeDasharray="3 3" 
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineaTiempo;
