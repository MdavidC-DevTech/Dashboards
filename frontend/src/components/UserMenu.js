// src/components/UserMenu.js
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import "../styles/userMenu.css";

function UserMenu({ currentUser }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="user-menu-container">
      {/* Ícono de usuario (avatar) */}
      <button className="user-menu-trigger" onClick={handleToggleMenu}>
        <FaUserCircle size={45} />
      </button>

      {/* Dropdown si isOpen es true */}
      {isOpen && (
        <div className="user-menu-dropdown">
          {/* Información básica del usuario */}
          {currentUser && (
            <div className="user-info">
              <p className="user-name">{currentUser.full_name}</p>
              {/* Si quieres mostrar el rol o colegio */}
              { <p className="user-email">{currentUser.email}</p>}
              {currentUser.collegeName}
            </div>
          )}

          <div className="menu-item logout" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Cerrar sesión</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
