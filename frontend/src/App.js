import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./styles/App.css"; // Importa tus estilos globales (layout, variables, etc.)

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
import { DataProvider, DataContext } from "./context/DataContext";

// Componente Loader
import Loader from "./components/Loader";

// Protege las rutas si no hay token
const ProtectedRoute = ({ children }) => {
  const { token } = React.useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

// Layout principal (header + sidebar + main + footer)
const MainLayout = ({ children }) => {
  const { currentUser, logout, loadingUser } = React.useContext(AuthContext);
  const { loadingData } = React.useContext(DataContext);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  // Mostrar loader si el usuario o la data están cargando
  if (loadingUser || loadingData) {
    return <Loader />;
  }

  return (
    <>
      {/* Header fijo */}
      <Header
        currentUser={currentUser}
        onLogout={logout}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Contenedor principal: Sidebar + Main Content */}
      <div
        className={`layout ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}
      >
        <Sidebar isOpen={isSidebarOpen} />

        {/* El contenido principal (pages) */}
        <main className="main-content">
          {children}
        </main>
      </div>

      <Footer />
    </>
  );
};

// Rutas que requieren autenticación
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

// Rutas públicas (para el login)
const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

// Determina si se muestra login o rutas protegidas
const AppRoutes = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  return isLoginPage ? <PublicRoutes /> : <AppContent />;
};

// App principal con Providers
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
