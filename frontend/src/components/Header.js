// src/components/Header.js
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaBars } from "react-icons/fa";

import logo from "../img/logo.png";
import UserMenu from "./UserMenu"; // Opcional, para icono/menú de usuario
import "../styles/header.css";

function Header({ onMenuClick }) {
  const { currentUser } = useContext(AuthContext);
 

  return (
    <header className="header">
      {/* Sección izquierda: botón hamburguesa y logo */}
      <div className="header-left">
        <button className="menu-button" onClick={onMenuClick}>
          <FaBars />
        </button>
        <img src={logo} alt="Logo" className="header-logo" />
      </div>

      {/* Sección central: título */}
      <div className="header-center">
        <h1 className="header-title">DASHBOARD</h1>
      </div>

      {/* Sección derecha: ícono de usuario, logout, etc. */}
      <div className="header-right">
        {/* Aquí puedes usar un UserMenu o un simple botón */}
        <UserMenu currentUser={currentUser} />
      </div>
    </header>
  );
}

export default Header;
