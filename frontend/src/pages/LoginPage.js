// src/pages/LoginPage.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);
      const response = await axios.post("http://127.0.0.1:8000/token", params);
      console.log("Token recibido:", response.data);
      onLoginSuccess(response.data);
      navigate("/profesores");
    } catch (err) {
      setError("Error de autenticación. Revisa tus credenciales.");
      console.error(err);
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f0f2f5"  // Fondo suave para toda la pantalla
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        backgroundColor: "#fff",  // Tarjeta blanca
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
      }}>
        <h2 style={{ 
          textAlign: "center", 
          color: "#003366", 
          marginBottom: "20px",
          fontFamily: "Arial, sans-serif"
        }}>
          Iniciar sesión
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "5px", 
              color: "#003366",
              fontWeight: "bold"
            }}>
              Usuario:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px"
              }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "5px", 
              color: "#003366",
              fontWeight: "bold"
            }}>
              Contraseña:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px"
              }}
            />
          </div>
          {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
          <button type="submit" style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#003366",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px"
          }}>
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
