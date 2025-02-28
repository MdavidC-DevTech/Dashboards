// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#eee", marginBottom: "10px" }}>
      <Link to="/profesores" style={{ marginRight: "20px" }}>Profesores</Link>
      <Link to="/estudiantes" style={{ marginRight: "20px" }}>Estudiantes</Link>
      <Link to="/acceso">Conteo Acceso</Link>
    </nav>
  );
}

export default Navbar;
