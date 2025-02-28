import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChalkboardTeacher, FaUserGraduate, FaDoorOpen } from 'react-icons/fa';

function Sidebar({ isOpen }) {
  const location = useLocation();

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
    whiteSpace: 'nowrap', // Evita que el texto se rompa
    overflow: 'hidden' // Oculta el desbordamiento
  });

  const iconStyle = {
    minWidth: '20px', // Asegura que los íconos mantengan su tamaño
    fontSize: '20px'
  };

  const menuItems = [
    { path: '/profesores', icon: <FaChalkboardTeacher style={iconStyle} />, text: 'Profesores' },
    { path: '/estudiantes', icon: <FaUserGraduate style={iconStyle} />, text: 'Estudiantes' },
    { path: '/acceso', icon: <FaDoorOpen style={iconStyle} />, text: 'Conteo de Acceso' }
  ];

  return (
    <aside style={{
      width: isOpen ? '250px' : '70px',
      backgroundColor: '#003366',
      height: 'calc(100vh - 64px)',
      transition: 'width 0.3s',
      position: 'fixed',
      left:'8px',
      top: '64px',
      overflowX: 'hidden',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      borderRadius: '10px'
    }}>
      <nav style={{ marginTop: '20px' }}>
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path} style={linkStyle(item.path)}>
            {item.icon}
            <span style={{
              opacity: isOpen ? 1 : 0,
              transition: 'opacity 0.3s',
              display: isOpen ? 'block' : 'none'
            }}>
              {item.text}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;