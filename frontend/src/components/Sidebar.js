import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChalkboardTeacher, FaUserGraduate, FaDoorOpen } from "react-icons/fa";
import "../styles/sidebar.css";
import { useTransition } from "../context/TransitionContext";

function Sidebar({ isOpen }) {
  const { startTransition } = useTransition();
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // Aplica tus clases CSS según el estado y el tamaño de pantalla
  let sidebarClass = "sidebar";
  if (isMobile) {
    sidebarClass += isOpen ? " sidebar--expanded-mobile" : " sidebar--hidden-mobile";
  } else {
    sidebarClass += !isOpen ? " sidebar--collapsed" : "";
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
            onClick={() => {
              if (location.pathname !== item.path) {
                startTransition(); // Activa la transición (por ejemplo, para mostrar un loader global)
              }
            }}
            className={location.pathname === item.path ? "active" : ""}
          >
            {item.icon}
            {isOpen && <span>{item.text}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
