import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import { CloseButton } from "../components/ui/button-close";
import axios from "axios";
import {toast} from "react-hot-toast";
import {FiEye, FiEyeOff} from "react-icons/fi";


export default function NuevaPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tokenValid, setTokenValid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError("Enlace inválido. Solicita un nuevo correo de recuperación.");
      return;
    }

    const validarToken = async () => {
      try {
        const response = await axios.get(`/validar-token`, {
          params: { token },
        });
        setTokenValid(response.data.valid === true);
      } catch {
        setTokenValid(false);
        setError("Enlace inválido o expirado. Solicita un nuevo correo.");
      }
    };

    validarToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }


    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const peticionRestablecer = axios.post(`/restablecer-password`, { token, password });
    toast.promise(peticionRestablecer, {
      loading: "Actualizando contraseña...",
      success: (response) => {
        setLoading(false);
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => navigate("/login"), 2500);

        return response.data.message || "Contraseña actualizada con éxito.";
      },
      error: (err) => {
        setLoading(false);
        return err.response?.data?.message ||
          "No se pudo actualizar la contraseña. Intenta de nuevo.";
      }
    });
  };

  const handleClose = () => {
    navigate("/login");
  };

  if (tokenValid === null) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white">
        <div className="flex w-full min-h-screen items-center justify-center p-4 bg-[linear-gradient(45deg,#56ccf2,#51c3f1,#4cb9f1,#47b0f0,#43a6f0,#3e9def,#3993ee,#348aee,#2f80ed)]">
          <p className="text-white font-medium">Validando enlace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white">
      <div className="flex w-full min-h-screen items-center justify-center p-4 bg-[linear-gradient(45deg,#56ccf2,#51c3f1,#4cb9f1,#47b0f0,#43a6f0,#3e9def,#3993ee,#348aee,#2f80ed)]">
        <div className="relative flex mx-auto w-full max-w-md rounded-2xl shadow-2xl items-center justify-center p-8 bg-white">
          <div className="absolute top-4 left-4">
            <CloseButton size="lg" theme="light" onClick={handleClose} />
          </div>
          <div className="w-full max-w-md">
            <div className="text-center mb-10 flex flex-col items-center">
              <img
                src="/logo_cantv.png"
                alt="CANTV Logo"
                className="h-16 w-auto mx-auto mb-6 block drop-shadow-lg"
              />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Nueva contraseña
              </h1>
              <p className="text-gray-500">
                Ingresa y confirma tu nueva contraseña.
              </p>
            </div>

            {tokenValid === false ? (
              <div className="space-y-4">
                <p className="text-sm text-red-600 text-center">{error}</p>
                <button
                  type="button"
                  onClick={() => navigate("/recuperar-password")}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-[0.98]"
                >
                  Solicitar nuevo enlace
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="password"
                  >
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm py-3 px-4 outline-none focus:ring-primary-500 focus:border-primary-500 border transition-all"
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

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="confirmPassword"
                  >
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm py-3 px-4 outline-none focus:ring-primary-500 focus:border-primary-500 border transition-all"
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
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? "Guardando..." : "Restablecer contraseña"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
