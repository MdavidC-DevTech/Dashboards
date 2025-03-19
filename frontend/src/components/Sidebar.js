// src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChalkboardTeacher, FaUserGraduate, FaDoorOpen } from 'react-icons/fa';

function Sidebar({ isOpen }) {
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Detectamos el ancho de la ventana para saber si es móvil
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;  // Menos de 768px => "móvil"

  // Definimos estilos base
  const sidebarStyle = {
    backgroundColor: '#003366',
    overflowX: 'hidden',
    transition: 'width 0.3s',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    zIndex: 9999,
    position: 'fixed',
    top: '64px', // Siempre debajo del header
    left: '8px',
    height: 'calc(100vh - 64px)',
    borderRadius: '10px',
  };

  // En móvil, queremos que desaparezca cuando isOpen=false => width=0
  // y cuando isOpen=true => width=250px
  // En escritorio, se comporta igual que antes: 70px o 250px
  if (isMobile) {
    sidebarStyle.width = isOpen ? '250px' : '0px';
  } else {
    sidebarStyle.width = isOpen ? '250px' : '70px';
  }

  // Estilos para cada Link
  const linkStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '15px 20px',
    color: '#fff',
    textDecoration: 'none',
    gap: '15px',
    backgroundColor: location.pathname === path ? '#004488' : 'transparent',
    transition: 'all 0.3s',
    borderLeft: location.pathname === path ? '4px solid #fff' : '4px solid transparent',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  });

  const iconStyle = {
    minWidth: '20px',
    fontSize: '20px'
  };

  const menuItems = [
    { path: '/profesores', icon: <FaChalkboardTeacher style={iconStyle} />, text: 'Profesores' },
    { path: '/estudiantes', icon: <FaUserGraduate style={iconStyle} />, text: 'Estudiantes' },
    { path: '/acceso', icon: <FaDoorOpen style={iconStyle} />, text: 'Conteo de Acceso' }
  ];

  return (
    <aside style={sidebarStyle}>
      {/* En móvil, si isOpen=false => width=0 => “oculto”.
          En escritorio, si isOpen=false => 70px => “colapsado”.
          En ambos casos, mostramos el nav sólo si el ancho > 0 */}
      {(!isMobile || isOpen) && (
        <nav style={{ marginTop: '20px' }}>
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} style={linkStyle(item.path)}>
              {item.icon}
              {/* Ocultamos el texto si está colapsado en escritorio
                  (isOpen=false => width=70px => texto con opacity=0) */}
              <span
                style={{
                  opacity: isOpen ? 1 : 0,
                  transition: 'opacity 0.3s',
                  display: isOpen ? 'block' : 'none'
                }}
              >
                {item.text}
              </span>
            </Link>
          ))}
        </nav>
      )}
    </aside>
  );
}

export default Sidebar;
