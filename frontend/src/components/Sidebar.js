import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChalkboardTeacher, FaUserGraduate, FaDoorOpen } from "react-icons/fa";
import "../styles/sidebar.css";

function Sidebar({ isOpen }) {
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  let sidebarClass = "sidebar";

  if (isMobile) {
    // En móvil, overlay:
    // Si isOpen => ".sidebar--mobile-visible", else => oculto
    if (isOpen) {
      sidebarClass += " sidebar--mobile-visible";
    }
  } else {
    // En escritorio:
    // Si isOpen => normal, else => .sidebar--hidden
    if (!isOpen) {
      sidebarClass += " sidebar--hidden";
    }
  }
  if (!isMobile) {
    // Si isOpen => sidebar ancho, si no => .sidebar--collapsed
    sidebarClass += isOpen ? "" : " sidebar--collapsed";
  }
  if (isMobile) {
    // overlay
    sidebarClass += isOpen ? " sidebar--mobile-visible" : "";
  }
  
  const menuItems = [
    { path: "/profesores", icon: <FaChalkboardTeacher />, text: "Profesores" },
    { path: "/estudiantes", icon: <FaUserGraduate />, text: "Estudiantes" },
    { path: "/acceso", icon: <FaDoorOpen />, text: "Conteo de Acceso" },
  ];

  return (
    <aside className={sidebarClass}>
      <nav>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={location.pathname === item.path ? "active" : ""}
          >
            {item.icon}
            {/* En escritorio, si isOpen => mostrar texto, si no => oculto
                En móvil, la overlay mostrará siempre el texto si .sidebar--mobile-visible */}
            {(isMobile && isOpen) || (!isMobile && isOpen) ? (
              <span>{item.text}</span>
            ) : null}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
