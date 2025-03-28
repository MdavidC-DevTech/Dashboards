// src/components/RankingBarrasProfesores.js

import React, { useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Tooltip personalizado para mostrar el nombre del profesor y los minutos
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, minutos } = payload[0].payload;
    return (
      <div style={{ backgroundColor: "#fff", border: "1px solid #ccc", padding: "5px" }}>
        <p><strong>Profesor:</strong> {name}</p>
        <p><strong>Minutos:</strong> {minutos}</p>
      </div>
    );
  }
  return null;
};

/**
 * Recibe:
 *  - data: array con objetos { user_fname, user_sname, active_seconds, [course_fullname], ... }
 *  - onRankingDataChange: callback que el padre puede pasar para obtener la data final (top/bottom)
 */
function RankingBarrasProfesores({ data, onRankingDataChange }) {
  // 1. Ordenar los datos de mayor a menor por active_seconds
  const sortedData = useMemo(() => {
    // Clonamos data para no mutar
    const clone = [...data];
    return clone.sort((a, b) => b.active_seconds - a.active_seconds);
  }, [data]);

  // 2. Convertimos cada objeto para la gráfica
  //    name => "Nombre Apellido"
  //    minutos => redondeado a int
  const fullData = useMemo(() => {
    return sortedData.map((item) => ({
      name: `${item.user_fname} ${item.user_sname}`,
      // course: item.course_fullname, // (opcional) si quisieras mostrar curso en el tooltip
      minutos: Math.round(item.active_seconds / 60),
    }));
  }, [sortedData]);

  // 3. Sacamos Top 10
  const top10 = useMemo(() => fullData.slice(0, 10), [fullData]);

  // 4. Sacamos Bottom 10 (excluimos el top 10 y luego los últimos 10, reversed)
  const bottom10 = useMemo(() => {
    const tail = fullData.slice(10);
    return tail.slice(-10).reverse();
  }, [fullData]);

  // 5. Unificamos top10 y bottom10 en un solo array para notificar al padre
  //    (les agregamos un campo "rankingType" para saber si es "TOP" o "BOTTOM")
  const finalRanking = useMemo(() => {
    return [
      ...top10.map((obj) => ({ ...obj, rankingType: "TOP" })),
      ...bottom10.map((obj) => ({ ...obj, rankingType: "BOTTOM" })),
    ];
  }, [top10, bottom10]);

  // 6. Notificamos al padre (si onRankingDataChange está definido)
  useEffect(() => {
    if (onRankingDataChange) {
      onRankingDataChange(finalRanking);
    }
  }, [finalRanking, onRankingDataChange]);

  return (
    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
      {/* Top 10 */}
      <div style={{ flex: 1, minWidth: "400px" }}>
        <h2 style={{ textAlign: "center" }}>Top 10 Profesores más activos</h2>
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

      {/* Bottom 10 (solo si hay suficientes registros) */}
      {bottom10.length > 0 && (
        <div style={{ flex: 1, minWidth: "400px" }}>
          <h2 style={{ textAlign: "center" }}>Bottom 10 Profesores menos activos</h2>
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

export default RankingBarrasProfesores;
