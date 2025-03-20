import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChalkboardTeacher, FaUserGraduate, FaDoorOpen } from "react-icons/fa";
import "../styles/App.css"; // Asegúrate de importar tus estilos globales

function Sidebar({ isOpen }) {
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Definimos si es móvil según el ancho
  const isMobile = windowWidth < 768;

  // Asignamos clases según estado y tamaño de pantalla
  let sidebarClass = "sidebar";
  if (isMobile) {
    sidebarClass += isOpen ? " sidebar--expanded-mobile" : " sidebar--hidden-mobile";
  } else {
    sidebarClass += isOpen ? "" : " sidebar--collapsed";
  }

  const menuItems = [
    { path: "/profesores", icon: <FaChalkboardTeacher />, text: "Profesores" },
    { path: "/estudiantes", icon: <FaUserGraduate />, text: "Estudiantes" },
    { path: "/acceso", icon: <FaDoorOpen />, text: "Conteo de Acceso" },
  ];

  return (
    <aside className={sidebarClass}>
      {(!isMobile || isOpen) && (
        <nav style={{ marginTop: "20px" }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? "active" : ""}
            >
              {item.icon}
              {isOpen && <span>{item.text}</span>}
            </Link>
          ))}
        </nav>
      )}
    </aside>
  );
}

export default Sidebar;
