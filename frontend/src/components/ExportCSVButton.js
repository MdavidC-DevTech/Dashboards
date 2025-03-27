// src/components/ExportCSVButton.js
import React from "react";
import { CSVLink } from "react-csv";

const ExportCSVButton = ({ data, filename, headers }) => {
  const csvHeaders = headers || [
    { label: "Fecha", key: "event_date" },
    { label: "Minutos Activo", key: "minutos_activo" },
  ];

  return (
    <CSVLink
      data={data}
      headers={csvHeaders}
      filename={filename || "export.csv"}
      className="btn-primary"
      target="_blank"
    >
      Exportar CSV
    </CSVLink>
  );
};

export default ExportCSVButton;
