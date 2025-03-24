// src/context/DataContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { fetchDatos } from "../services/api";
import { AuthContext } from "./AuthContext";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { token } = useContext(AuthContext);

  // Estados locales
  const [data, setData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errorData, setErrorData] = useState(null);

  // Función para cargar los datos, memorizada con useCallback
  const loadData = useCallback(async () => {
    if (!token) {
      setData([]);
      setErrorData(null);
      setLoadingData(false);
      return;
    }
    try {
      setLoadingData(true);
      setErrorData(null);
      const result = await fetchDatos();
      setData(result);
    } catch (err) {
      console.error("Error al cargar datos:", err.response || err);
      setErrorData(err);
    } finally {
      setLoadingData(false);
    }
  }, [token]);

  // useEffect para cargar data cuando cambia loadData (o token)
  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <DataContext.Provider value={{ data, loadingData, errorData, loadData }}>
      {children}
    </DataContext.Provider>
  );
};
