import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiCpu } from "react-icons/fi";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleLogin = (e) => {
    e.preventDefault();
    if (formData.username && formData.password) {
      navigate("/dashboard");
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
                    id="username"
                    type="username"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
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
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm py-3 px-4 outline-none focus:ring-primary-500 focus:border-primary-500 border transition-all"
                    placeholder="••••••••"
                  />
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
