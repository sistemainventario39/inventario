import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Busqueda from './pages/Busqueda';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';
import RegistroUsuarios from "./pages/RegistroUsuarios";
import RecuperarPassword from "./pages/Recuperar-Password";
import NuevaPassword from "./pages/NuevaPassword";
import {Toaster} from "react-hot-toast"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/busqueda" element={<Busqueda />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/registro-usuarios" element={<RegistroUsuarios />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        <Route path="/nueva-password" element={<NuevaPassword />} />
      </Routes>
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'text-sm font-semibold rounded-xl shadow-lg border border-gray-100',
          style: {
            background: '#ffffff',
            color: '#1f2937', // Un gris oscuro elegante para el texto
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#059669', // Verde esmeralda para el éxito
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444', // Rojo para los errores
              secondary: '#ffffff',
            },
          },
        }}
      />
    </Router>
    
  );
}

export default App;
