// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

// Creamos el contexto
export const AuthContext = createContext();

// Componente que provee el contexto
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("access_token") || null);
  const [currentUser, setCurrentUser] = useState(null);

  // Función para iniciar sesión (actualiza el token y luego carga el usuario)
  const login = (access_token) => {
    localStorage.setItem("access_token", access_token);
    setToken(access_token);
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setCurrentUser(null);
  };

  // Cada vez que el token cambie, llamamos a /auth/users/me para obtener la info del usuario
  useEffect(() => {
    if (token) {
      api.get("/auth/users/me")
        .then((response) => {
          // Asumiendo que response.data.user = { username, full_name, role, ... }
          setCurrentUser(response.data.user);
        })
        .catch((error) => {
          console.error("Error al obtener datos del usuario:", error);
          logout();
        });
    } else {
      setCurrentUser(null);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
