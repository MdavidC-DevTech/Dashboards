// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import ProfesoresPage from "./pages/ProfesoresPage";
import EstudiantesPage from "./pages/EstudiantesPage";
import ConteoAccesoPage from "./pages/ConteoAccesoPage";

function MainLayout({ children, isSidebarOpen, onMenuClick, currentUser, onLogout }) {
  return (
    <>
      <Header currentUser={currentUser} onLogout={onLogout} onMenuClick={onMenuClick} />
      <Sidebar isOpen={isSidebarOpen} />
      <main
        style={{
          flex: 1,
          marginLeft: isSidebarOpen ? "250px" : "70px",
          padding: "20px",
          transition: "margin-left 0.3s",
          backgroundColor: "#f5f5f5",
        }}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}

function AuthLayout({ children }) {
  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  // Estado para token y para información del usuario actual
  const [token, setToken] = useState(localStorage.getItem("access_token") || null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Función para cargar la info del usuario actual usando /users/me
  const fetchCurrentUser = async (token) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
    }
  };

  // Al inicio o cuando token cambia, si existe, carga el usuario
  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setCurrentUser(null);
    }
  }, [token]);

  const handleLoginSuccess = (data) => {
    setToken(data.access_token);
    localStorage.setItem("access_token", data.access_token);
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("access_token");
  };

  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  if (isLoginPage) {
    return (
      <AuthLayout>
        <Routes>
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthLayout>
    );
  }

  return (
    <MainLayout
      isSidebarOpen={isSidebarOpen}
      onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      <Routes>
        <Route path="/profesores" element={<ProtectedRoute><ProfesoresPage /></ProtectedRoute>} />
        <Route path="/estudiantes" element={<ProtectedRoute><EstudiantesPage /></ProtectedRoute>} />
        <Route path="/acceso" element={<ProtectedRoute><ConteoAccesoPage /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><ProfesoresPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </MainLayout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
