// src/components/PieCursos.js
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Sector } from "recharts";
import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import { Row, Col} from 'react-bootstrap';

const colorScale = scaleOrdinal(schemeCategory10);

const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#333" // borde
        strokeWidth={2}
      />
    </g>
  );
};
const PieCursos = ({ data, onPieDataChange }) => {

  const [activeIndex, setActiveIndex] = useState(null);
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
    <Row className="justify-content-md-center">
      <Col md={6} style={{marginTop: "150px", marginBottom: "150px"}}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataEnMinutos}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={130}
            labelLine={false}
            label={false}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
          >
            {dataEnMinutos.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colorScale(entry.name)} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} minutos`} />
        </PieChart>
      </ResponsiveContainer>
      </Col>
      <Col md={6}>
      <div style={{ marginTop: "1rem" }}>
        <h4>Distribución por curso</h4>
        <ul style={{ paddingLeft: "1rem"}}>
          {finalWithPct.map((item, i) => (
            <li
              key={i}
              onMouseEnter={() => setActiveIndex(i)} // hover activa sector del grafico
              onMouseLeave={() => setActiveIndex(null)} // al salir, desactiva
              style={{
                cursor: "pointer",
                fontWeight: activeIndex === i ? "bold" : "normal",
                color: activeIndex === i ? "#333" : "#666",
              }}
            >
              {item.name.length > 30 ? item.name.slice(0, 30) + "..." : item.name}
              : {item.value} min ({item.percentage}%)
            </li>
          ))}
        </ul>
      </div>
      </Col>
    </Row>
  );
};

export default PieCursos;
