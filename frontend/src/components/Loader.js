// src/components/Loader.js
import React from 'react';

const Loader = () => {
  return (
    <div style={{
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '5px solid #ccc',
        borderTopColor: '#003366',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}></div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
    
  );
  <div><h1>Cargando Datos</h1></div>
};

export default Loader;
