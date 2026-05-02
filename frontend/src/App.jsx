import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Busqueda from './pages/Busqueda';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';
import RegistroUsuarios from "./pages/RegistroUsuarios";
import RecuperarPassword from "./pages/Recuperar-Password";

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
      </Routes>
    </Router>
  );
}

export default App;
