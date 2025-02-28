// src/components/Header.js
import React from "react";
import { FaBars } from "react-icons/fa";
import logo from "../img/logo.png";

function Header({ currentUser, onLogout, onMenuClick }) {
  return (
    <header style={{
      backgroundColor: "#003366",
      color: "#fff",
      padding: "10px 20px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      width: "100%"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        maxWidth: "97%",
        margin: "0 auto",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button 
            onClick={onMenuClick}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "24px",
              cursor: "pointer",
              padding: "5px",
              display: "flex",
              alignItems: "center"
            }}
          >
            <FaBars />
          </button>
          <img src={logo} alt="Logo Robotics Mins" style={{ height: "40px" }} />
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>Dashboard</h1>
        </div>
        {/* Mostrar el nombre del usuario y el botón de cerrar sesión */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          
          {currentUser && <span>Bienvenido, {currentUser.full_name} ({currentUser.role})</span>}
          <button 
            onClick={onLogout}
            style={{
              background: "#ff4d4d",
              border: "none",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
