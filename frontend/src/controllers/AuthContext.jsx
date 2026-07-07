import React, { createContext, useState, useContext, useEffect } from "react";
import Axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const comprobarSesion = async () => {
      try {
        const response = await Axios.get("/api/me", {
          withCredentials: true, // <--- ¡Vital para que envíe la cookie "acceso_token"!
        });

        if (response.status === 200) {
          setUser(response.data.user); // Guardamos al usuario en el estado global
        }
      } catch (error) {
        // Si el token expiró o no existe (Error 401), aseguramos que el usuario sea null
        setUser(null);
      } finally {
        // Apagamos el estado de carga pase lo que pase
        setCargando(false);
      }
    };

    comprobarSesion();
  }, []);

  const loginGlobal = (userData) => setUser(userData);
  const logoutGlobal = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loginGlobal, logoutGlobal, cargando }}>
      {/* No renderizamos la app hasta que termine de verificar si hay sesión */}
      {!cargando && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
