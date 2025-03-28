import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./styles/App.css";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import ProfesoresPage from "./pages/ProfesoresPage";
import EstudiantesPage from "./pages/EstudiantesPage";
import ConteoAccesoPage from "./pages/ConteoAccesoPage";
import Loader from "./components/Loader";
import { TransitionProvider } from "./context/TransitionContext";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import { DataProvider, DataContext } from "./context/DataContext";

import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });

const ProtectedRoute = ({ children }) => {
  const { token } = React.useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

const MainLayout = ({ children }) => {
  const { currentUser, logout, loadingUser } = React.useContext(AuthContext);
  const { loadingData } = React.useContext(DataContext);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  // Mientras se cargan el usuario o la data, mostramos Loader
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
      <div className={`layout ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
        <Sidebar isOpen={isSidebarOpen} />
        <main className="main-content">{children}</main>
      </div>
      <Footer />
    </>
  );
};

const AuthenticatedRoutes = () => (
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

const PublicRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="*" element={<Navigate to="/login" />} />
  </Routes>
);

// Este componente escucha los cambios de ruta y usa NProgress para mostrar un loader inmediato
const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();
    return () => {
      NProgress.done();
    };
  }, [location]);

  const isLoginPage = location.pathname === "/login";
  return isLoginPage ? <PublicRoutes /> : <AuthenticatedRoutes />;
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <TransitionProvider>
          <Router>
            <AppRoutes />
          </Router>
        </TransitionProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
