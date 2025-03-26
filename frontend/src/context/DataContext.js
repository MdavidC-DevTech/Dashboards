// src/context/DataContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { fetchDatos } from "../services/api";
import { AuthContext } from "./AuthContext";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { token } = useContext(AuthContext);

  // Estados locales
  const [data, setData] = useState([]);
  const [collegeName, setCollegeName] = useState("Mi Colegio");
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
      // Extrae el nombre del colegio del primer registro (si existe)
      if (result && result.length > 0 && result[0].category_name) {
        setCollegeName(result[0].category_name);
      } else {
        setCollegeName("Mi Colegio");
      }
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
    <DataContext.Provider value={{ data, loadingData, errorData, loadData,collegeName  }}>
      {children}
    </DataContext.Provider>
  );
};
