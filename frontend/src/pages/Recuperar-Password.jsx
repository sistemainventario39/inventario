import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { CloseButton } from "../components/ui/button-close";
import axios from "axios";
import {toast} from "react-hot-toast";
import logoCantv from "../assets/logo_cantv.png";

export default function RecuperarPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const peticionCorreo = axios.post(`/recuperar-password`, { email });

    toast.promise(peticionCorreo, {
      loading: "Enviando correo de recuperación...",
      success: (response) => {
        setEmail("");
        setLoading(false);
        setTimeout(() => navigate("/login"), 2500);
        return response.data.message || "Correo de recuperación enviado con éxito.";
      },
      error: (err) => {
        setLoading(false);
        return err.response?.data?.message ||
          "Error al enviar el correo de recuperación. Intenta más tarde."
      }
    });
  };

  const handleClose = () => {
    navigate("/login");
  };

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
                src={logoCantv}
                alt="CANTV Logo"
                className="h-16 w-auto mx-auto mb-6 block drop-shadow-lg"
              />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenido de nuevo
              </h1> 
              <p className="text-gray-500">
                Ingresa tu correo electrónico para recuperar tu contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="email"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm py-3 px-4 outline-none focus:ring-primary-500 focus:border-primary-500 border transition-all"
                    placeholder="gol@gol.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "Enviando..." : "Enviar código"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
