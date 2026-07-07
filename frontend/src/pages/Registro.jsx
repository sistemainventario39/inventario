import React, { useState } from "react";
import Header from "../components/layout/Header";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { equipoSchema } from "../validators/equipoSchema";

import EquipoForm from "./Equipos/EquipoForm";
import { defaultFormData } from "../utils/defaultFormData";
import { buildPayload } from "../utils/buildPayload";

export default function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      equipoSchema.parse(formData);
    } catch (error) {
      if (error.errors) {
        toast.error(`Revisa el formulario: ${error.errors[0].message}`);
      } else {
        toast.error(
          error.response?.data?.message || "Ocurrió un error al registrar.",
        );
      }
      setIsSubmitting(false);
      return;
    }

    const tipoDispositivo = formData.type.toUpperCase();
    const payload = buildPayload(formData);

    let url = "";
    if (tipoDispositivo === "PC" || tipoDispositivo === "LAPTOP") {
      url =
        tipoDispositivo === "LAPTOP"
          ? "/api/laptop"
          : "/api/pc";
    } else {
      url = `/api/perifericos/${formData.type}`;
    }

    const peticionRegistro = axios.post(url, payload, {
      withCredentials: true,
    });

    toast
      .promise(peticionRegistro, {
        loading: "Registrando equipo...",
        success: (response) => {
          setTimeout(() => navigate("/registro"), 3000);
          return response.data.message || "Equipo registrado exitosamente.";
        },
        error: (err) =>
          err.response?.data?.message ||
          "Error al registrar el equipo. Intenta nuevamente.",
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-primary-900 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">
              Registro de Nuevo Equipo
            </h1>
            <p className="text-primary-100 text-sm mt-1">
              Ingresa los detalles técnicos del componente y sus periféricos al
              inventario.
            </p>
          </div>
          <EquipoForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode="create"
            isSubmitting={isSubmitting}
          />
        </div>
      </main>
    </div>
  );
}
