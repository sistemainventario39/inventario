import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiCpu, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-hot-toast";
import Axios from "axios";
import { useAuth } from "../controllers/AuthContext";

export default function Login() {
  const { loginGlobal } = useAuth();
  const [loading, setLoading] = useState(false); // Estado para feedback visual
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ correo: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Creamos una notificación de carga (opcional pero muy pro)
    const toastId = toast.loading("Verificando credenciales...");

    try {
      const response = await Axios.post(
        "/api/login",
        {
          correo: formData.correo,
          password: formData.password,
        },
        {
          withCredentials: true, // <--- ¡AQUÍ ES DONDE DEBE IR!
        },
      );

      if (response.status === 200) {
        toast.success("¡Bienvenido de nuevo!", { id: toastId });
        loginGlobal(response.data.user);
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (error) {
      const mensajeError =
        error.response?.data?.message || "Error de conexión con el servidor";
      toast.error(mensajeError, { id: toastId }); // Reemplaza el loading por error
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white">
      <div className="flex w-full min-h-screen items-center justify-center p-4 bg-[linear-gradient(45deg,#56ccf2,#51c3f1,#4cb9f1,#47b0f0,#43a6f0,#3e9def,#3993ee,#348aee,#2f80ed)]">
        <div className="flex mx-auto w-full max-w-md rounded-2xl shadow-2xl items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            <div className="text-center mb-10 flex flex-col items-center">
              <img
                src="/logo_cantv.png"
                alt="CANTV Logo"
                className="h-16 w-auto mx-auto mb-6 block drop-shadow-lg"
              />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenido de nuevo
              </h1>
              <p className="text-gray-500">
                Ingresa tus credenciales para acceder al sistema corporativo.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="username"
                >
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="correo"
                    type="correo"
                    required
                    value={formData.correo}
                    onChange={(e) =>
                      setFormData({ ...formData, correo: e.target.value })
                    }
                    className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm py-3 px-4 outline-none focus:ring-primary-500 focus:border-primary-500 border transition-all"
                    placeholder="golazo7"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="password"
                  >
                    Contraseña
                  </label>
                  <a
                    href="/recuperar-password"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-10 pr-10 block w-full border-gray-300 rounded-lg shadow-sm py-3 px-4 outline-none focus:ring-primary-500 focus:border-primary-500 border transition-all"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                      >
                        {showPassword ? (
                          <FiEyeOff className="h-5 w-5" />
                        ) : (
                          <FiEye className="h-5 w-5" />
                        )}
                      </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-[0.98]"
              >
                Iniciar sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
