// src/components/RankingBarrasEstudiantes.js
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

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, minutos } = payload[0].payload;
    return (
      <div style={{ backgroundColor: "#fff", border: "1px solid #ccc", padding: "5px" }}>
        <p><strong>Estudiante:</strong> {name}</p>
        <p><strong>Minutos:</strong> {minutos}</p>
      </div>
    );
  }
  return null;
};

/**
 * data: array con { user_fname, user_sname, active_seconds, ... }
 * onRankingDataChange: callback que le pasa al padre la data final (TOP/BOTTOM).
 */
function RankingBarrasEstudiantes({ data, onRankingDataChange }) {
  // 1) Ordenamos data de mayor a menor
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.active_seconds - a.active_seconds);
  }, [data]);

  // 2) Mapeamos a la forma que usa el gráfico (name, minutos)
  const fullData = useMemo(() => {
    return sortedData.map((item) => ({
      name: `${item.user_fname} ${item.user_sname}`,
      minutos: Math.round(item.active_seconds / 60),
    }));
  }, [sortedData]);

  // 3) Top 10
  const top10 = useMemo(() => fullData.slice(0, 10), [fullData]);
  // 4) Bottom 10
  const bottomTail = useMemo(() => fullData.slice(10), [fullData]);
  const bottom10 = useMemo(() => bottomTail.slice(-10).reverse(), [bottomTail]);

  // 5) Unificamos top y bottom en un solo array con rankingType
  //    Use useMemo so we only compute once per change, not every render
  const finalRanking = useMemo(() => {
    return [
      ...top10.map((obj) => ({ ...obj, rankingType: "TOP" })),
      ...bottom10.map((obj) => ({ ...obj, rankingType: "BOTTOM" })),
    ];
  }, [top10, bottom10]);

  // 6) Notificar al padre una sola vez cuando finalRanking cambie
  useEffect(() => {
    if (onRankingDataChange) {
      onRankingDataChange(finalRanking);
    }
  }, [finalRanking, onRankingDataChange]);

  return (
    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
      {/* Top 10 */}
      <div style={{ flex: 1, minWidth: "400px" }}>
        <h2 style={{ textAlign: "center" }}>Top 10 Estudiantes más activos</h2>
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

      {/* Bottom 10 (si aplica) */}
      {bottom10.length > 0 && (
        <div style={{ flex: 1, minWidth: "400px" }}>
          <h2 style={{ textAlign: "center" }}>Bottom 10 Estudiantes menos activos</h2>
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
