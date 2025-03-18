// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import api from "./services/api";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import ProfesoresPage from "./pages/ProfesoresPage";
import EstudiantesPage from "./pages/EstudiantesPage";
import ConteoAccesoPage from "./pages/ConteoAccesoPage";

// Layout para rutas autenticadas (con header, sidebar, etc.)
const MainLayout = ({ children, currentUser, onLogout, onMenuClick, isSidebarOpen }) => {
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
};

// Layout para la autenticación (solo el Login)
const AuthLayout = ({ children }) => {
  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const [token, setToken] = useState(localStorage.getItem("access_token") || null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loadingUser, setLoadingUser] = useState(false);

  // Se ejecuta cada vez que el token cambia
  useEffect(() => {
    if (token) {
      setLoadingUser(true);
      api
        .get("/auth/users/me")
        .then((response) => {
          console.log("Respuesta de /auth/users/me:", response.data);
          setCurrentUser(response.data.user);
        })
        .catch((error) => {
          console.error("Error al obtener datos del usuario:", error);
          setCurrentUser(null);
          localStorage.removeItem("access_token");
          setToken(null);
        })
        .finally(() => {
          setLoadingUser(false);
        });
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

  // ProtectedRoute: si hay token se muestra, sino redirige a /login
  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  // Si estamos en /login, mostramos solo el AuthLayout
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

  // Mientras se carga la info del usuario, podríamos mostrar un loader
  if (loadingUser) {
    return <div>Cargando información...</div>;
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
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
