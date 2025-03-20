// src/components/Loader.js
import React from "react";
import "../styles/Loader.css"; // Define la animación aquí

const Loader = () => (
  <div className="loader-container">
    <div className="spinner"></div>
    <div></div>
    <div><h1>Cargargando datos espere....</h1></div>
  </div>
  
);

export default Loader;
