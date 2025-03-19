// src/components/Header.js
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaBars } from "react-icons/fa";
import logo from "../img/logo.png";
import { useNavigate } from "react-router-dom";

function Header({ onMenuClick }) {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Redirige al login después de cerrar sesión
    navigate("/login");
  };
  return (
    <header className="header">
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <button
          onClick={onMenuClick}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "24px",
            cursor: "pointer",
            padding: "5px"
          }}
        >
          <FaBars />
        </button>
        <img src={logo} alt="Logo" style={{ height: "40px" }} />
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>Dashboard</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {currentUser && (
          <span>
            Bienvenido, {currentUser.full_name} ({currentUser.role})
            {currentUser.collegeName && ` - ${currentUser.collegeName}`}
          </span>
        )}
        <button
          onClick={handleLogout}
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
    </header>
  );
}

export default Header;