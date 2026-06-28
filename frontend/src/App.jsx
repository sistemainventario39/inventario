import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Busqueda from "./pages/Busqueda";
import Registro from "./pages/Registro";
import Perfil from "./pages/Perfil";
import RegistroUsuarios from "./pages/RegistroUsuarios";
import RecuperarPassword from "./pages/Recuperar-Password";
import NuevaPassword from "./pages/NuevaPassword";
import Bitacora from "./pages/Bitacora";
import Ubicacion from "./pages/Ubicacion/Ubicacion";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "../src/controllers/AuthContext";

const RutaProtegida = () => {
  const { user, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-sm font-semibold text-gray-500">
          Verificando sesión...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar-password" element={<RecuperarPassword />} />
          <Route path="/nueva-password" element={<NuevaPassword />} />
          <Route element={<RutaProtegida />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/busqueda" element={<Busqueda />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/registro-usuarios" element={<RegistroUsuarios />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/bitacora" element={<Bitacora />} />
            <Route path="/ubicacion" element={<Ubicacion />} />
          </Route>
        </Routes>

        <Toaster
          position="top-center"
          toastOptions={{
            className:
              "text-sm font-semibold rounded-xl shadow-lg border border-gray-100",
            style: {
              background: "#ffffff",
              color: "#1f2937",
              padding: "12px 16px",
            },
            success: {
              iconTheme: { primary: "#059669", secondary: "#ffffff" },
            },
            error: {
              iconTheme: { primary: "#EF4444", secondary: "#ffffff" },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
