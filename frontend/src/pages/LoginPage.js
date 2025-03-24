// src/pages/LoginPage.js
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "../styles/login.css"; // nuevo archivo de estilos para LoginPage
import logo from "../img/logo.png";

function LoginPage() {
  const { currentUser, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Si ya existe un usuario autenticado, redirige automáticamente a /profesores
  useEffect(() => {
    if (currentUser) {
      navigate("/profesores");
    }
  }, [currentUser, navigate]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/token", { username, password });
      const { access_token } = response.data;
      // Guarda el token en localStorage y actualiza el contexto
      localStorage.setItem("access_token", access_token);
      login(access_token);
      // Redirige a la página de profesores
      navigate("/profesores");
    } catch (err) {
      setError("Error de autenticación. Revisa tus credenciales.");
      console.error(err);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        {/* LOGO */}
        <h2 className="login-title">Bienvenido a Dashboard</h2>
         <img src={logo} alt="Robotic Minds" className="login-logo" />
        {/* TÍTULO */}
        <h2 className="login-title">Iniciar sesión</h2>
        {/* FORMULARIO */}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Usuario:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;