// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./styles/App.css"; // Importa el CSS global

// Componentes y páginas
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import ProfesoresPage from "./pages/ProfesoresPage";
import EstudiantesPage from "./pages/EstudiantesPage";
import ConteoAccesoPage from "./pages/ConteoAccesoPage";

// Contextos
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { DataProvider, DataContext } from "./context/DataContext"; // <-- Asegúrate de importar DataContext

// Componente Loader para mostrar mientras se carga información
import Loader from "./components/Loader";

// Componente ProtectedRoute: si no hay token en el contexto, redirige a /login
const ProtectedRoute = ({ children }) => {
  const { token } = React.useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

// Layout principal para las rutas protegidas
const MainLayout = ({ children }) => {
  const { currentUser, logout, loadingUser } = React.useContext(AuthContext);
  const { loadingData } = React.useContext(DataContext);  // <-- Importante
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  // Mientras se carga la info de usuario o la data, muestra Loader
  if (loadingUser || loadingData) {
    return <Loader />;
  }


  return (
    <>
      <Header
        currentUser={currentUser}
        onLogout={logout}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <Sidebar isOpen={isSidebarOpen} />
      <main
        style={{
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

// Rutas protegidas (para usuarios autenticados)
const AppContent = () => {
  return (
    <MainLayout>
      <Routes>
        <Route
          path="/profesores"
          element={
            <ProtectedRoute>
              <ProfesoresPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/estudiantes"
          element={
            <ProtectedRoute>
              <EstudiantesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/acceso"
          element={
            <ProtectedRoute>
              <ConteoAccesoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProfesoresPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </MainLayout>
  );
};

// Rutas públicas: solo para el login
const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

// Componente que decide qué rutas mostrar según la ruta actual
const AppRoutes = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  return isLoginPage ? <PublicRoutes /> : <AppContent />;
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppRoutes />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
