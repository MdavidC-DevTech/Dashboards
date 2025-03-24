import React from "react";
import "../styles/Loader.css"; // Importa los estilos del loader

function Loader() {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p className="loader-text">Cargando datos...</p>
    </div>
  );
}

export default Loader;
