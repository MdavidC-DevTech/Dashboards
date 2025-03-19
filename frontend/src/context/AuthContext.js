// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

// Creamos el contexto
export const AuthContext = createContext();

// Componente que provee el contexto

export const AuthProvider = ({ children }) => {
  // Inicia token desde localStorage (si existe)
  const [token, setToken] = useState(localStorage.getItem("access_token") || null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Función para iniciar sesión: guarda token en el estado y en localStorage
  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("access_token", newToken);
  };

  // Función para cerrar sesión: limpia token y usuario
  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("access_token");
  };

  // Cada vez que el token cambia, se intenta cargar la info del usuario
  useEffect(() => {
    if (token) {
      setLoadingUser(true);
      api.get("/auth/users/me")
        .then((response) => {
          // Se espera que la respuesta tenga la propiedad "user"
          setCurrentUser(response.data.user);
        })
        .catch((err) => {
          console.error("Error al obtener datos del usuario:", err);
          setCurrentUser(null);
          // Si falla la consulta, se limpia el token
          logout();
          setToken(null);
          localStorage.removeItem("access_token");
        })
        .finally(() => setLoadingUser(false));
    } else {
      setCurrentUser(null);
      setLoadingUser(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, currentUser, loadingUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
