// src/context/DataContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { fetchDatos } from "../services/api";
import { AuthContext } from "./AuthContext";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // Usamos el token del AuthContext para saber si el usuario está autenticado
  const { token } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!token) {
      // Si no hay token, vaciamos la data y detenemos el loader
      setData([]);
      setLoadingData(false);
      return;
    }
    setLoadingData(true);
    // fetchDatos debe ser una función que realice la consulta a tu endpoint, por ejemplo: GET /data/datos
    fetchDatos()
      .then((data) => setData(data))
      .catch((err) => console.error("Error al cargar datos:", err))
      .finally(() => setLoadingData(false));
  }, [token]); // Se vuelve a ejecutar cada vez que cambia el token

  return (
    <DataContext.Provider value={{ data, loadingData }}>
      {children}
    </DataContext.Provider>
  );
};
