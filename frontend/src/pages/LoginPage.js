// src/pages/LoginPage.js
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

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
        <h2 style={{ textAlign: "center", color: "#003366", marginBottom: "20px", fontFamily: "Arial, sans-serif" }}>
          Iniciar sesión
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#003366", fontWeight: "bold" }}>
              Usuario:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#003366", fontWeight: "bold" }}>
              Contraseña:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
            />
          </div>
          {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#003366",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;