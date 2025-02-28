// src/components/PieRecuento.js
import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Función para agrupar datos por la categoría "recuento_activo"
const agruparPorCategoria = (data) => {
  const agrupado = {};
  data.forEach((item) => {
    const categoria = item.recuento_activo;
    agrupado[categoria] = (agrupado[categoria] || 0) + 1;
  });
  // Convertir el objeto a un arreglo
  return Object.entries(agrupado).map(([key, value]) => ({ categoria: key, count: value }));
};

const PieRecuento = ({ data }) => {
  const datosAgrupados = agruparPorCategoria(data);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div>
      <h2>Distribución de Categorías de Recuento Activo</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={datosAgrupados}
            dataKey="count"
            nameKey="categoria"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {datosAgrupados.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieRecuento;
    