import React, { useEffect, useRef } from "react";
import axios from "axios";
import { FiX, FiSave } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { ubicacionSchema } from "../../validators/ubicacionSchema";
import { useUbicaciones, ALA_OPCIONES } from "../../controllers/useUbicacion";

const inputClass = ({ hasError, isSuccess }) => `
  block w-full rounded-lg shadow-sm py-2 px-3 text-sm border transition-all duration-200 outline-none bg-white
  hover:border-gray-400
  disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
  ${
    hasError
      ? "border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-500"
      : isSuccess
        ? "border-green-400 focus:ring-2 focus:ring-green-200 focus:border-green-500"
        : "border-gray-300 focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
  }
`;

export default function UbicacionModal({ isOpen, onClose, onUbicacionCreada }) {
  const prevRegion = useRef(null);
  const prevEstado = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getFieldState,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ubicacionSchema),
    mode: "onChange",
    defaultValues: {
      region: "",
      estado: "",
      ciudad: "",
      sede: "",
      piso: "",
      ala: "",
    },
  });

  const regionActual = watch("region");
  const estadoActual = watch("estado");

  const { regionList, estadoList, ciudadesList } = useUbicaciones({
    regionActual,
    estadoActual,
  });

  useEffect(() => {
    if (!isOpen) {
      prevRegion.current = null;
      prevEstado.current = null;
      return;
    }
    reset({
      region: "",
      estado: "",
      ciudad: "",
      sede: "",
      piso: "",
      ala: "",
    });
  }, [isOpen, reset]);

  useEffect(() => {
    if (prevRegion.current !== null && prevRegion.current !== regionActual) {
      setValue("estado", "");
      setValue("ciudad", "");
      prevEstado.current = null;
    }
    prevRegion.current = regionActual;
  }, [regionActual, setValue]);

  useEffect(() => {
    if (prevEstado.current !== null && prevEstado.current !== estadoActual) {
      setValue("ciudad", "");
    }
    prevEstado.current = estadoActual;
  }, [estadoActual, setValue]);

  const getFieldProps = (name) => {
    const state = getFieldState(name);
    return {
      className: inputClass({
        hasError: state.invalid,
        isSuccess: state.isDirty && !state.invalid,
      }),
      error: state.invalid ? errors[name]?.message : null,
    };
  };

  const resolverNombre = (lista, id, campoId) => {
    const item = lista.find((i) => String(i[campoId]) === String(id));
    return item?.nombre || "";
  };

  const onSubmit = async (data) => {
    const payload = {
      region: resolverNombre(regionList, data.region, "id_region"),
      estado: resolverNombre(estadoList, data.estado, "id_estado"),
      ciudad: resolverNombre(ciudadesList, data.ciudad, "id_ciudad"),
      sede: data.sede.trim(),
      piso: data.piso.trim(),
      ala: data.ala || null,
    };

    if (!payload.region || !payload.estado || !payload.ciudad) {
      toast.error("Selecciona región, estado y ciudad válidos.");
      return;
    }

    const peticion = axios.post(
      "http://localhost:3001/api/ubicaciones",
      payload,
      { withCredentials: true },
    );

    toast.promise(peticion, {
      loading: "Registrando ubicación...",
      success: (response) => {
        reset();
        onUbicacionCreada?.();
        onClose();
        return response.data.message || "Ubicación registrada con éxito";
      },
      error: (error) =>
        error.response?.data?.message || "Error al registrar la ubicación",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="bg-primary-900 px-6 py-5 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Nueva Ubicación</h2>
            <p className="text-primary-100 text-sm mt-1">
              Registra un depósito en el sistema.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-primary-200 hover:text-white p-2 rounded-lg hover:bg-primary-800 transition-colors"
            aria-label="Cerrar"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Región <span className="text-red-500">*</span>
              </label>
              <select
                {...register("region")}
                className={getFieldProps("region").className}
              >
                <option value="">-- Selecciona --</option>
                {regionList.map((r) => (
                  <option key={r.id_region} value={r.id_region}>
                    {r.nombre}
                  </option>
                ))}
              </select>
              {getFieldProps("region").error && (
                <p className="text-xs text-red-600 mt-1">
                  {getFieldProps("region").error}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                {...register("estado")}
                disabled={!regionActual}
                className={getFieldProps("estado").className}
              >
                <option value="">
                  {regionActual
                    ? "-- Selecciona --"
                    : "-- Selecciona una región primero --"}
                </option>
                {estadoList.map((e) => (
                  <option key={e.id_estado} value={e.id_estado}>
                    {e.nombre}
                  </option>
                ))}
              </select>
              {getFieldProps("estado").error && (
                <p className="text-xs text-red-600 mt-1">
                  {getFieldProps("estado").error}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Ciudad <span className="text-red-500">*</span>
              </label>
              <select
                {...register("ciudad")}
                disabled={!estadoActual}
                className={getFieldProps("ciudad").className}
              >
                <option value="">
                  {estadoActual
                    ? "-- Selecciona --"
                    : "-- Selecciona un estado primero --"}
                </option>
                {ciudadesList.map((c) => (
                  <option key={c.id_ciudad} value={c.id_ciudad}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {getFieldProps("ciudad").error && (
                <p className="text-xs text-red-600 mt-1">
                  {getFieldProps("ciudad").error}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Sede <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Torre 30"
                {...register("sede")}
                className={getFieldProps("sede").className}
              />
              {getFieldProps("sede").error && (
                <p className="text-xs text-red-600 mt-1">
                  {getFieldProps("sede").error}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Piso <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ej: 3"
                {...register("piso", {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  },
                })}
                className={getFieldProps("piso").className}
              />
              {getFieldProps("piso").error && (
                <p className="text-xs text-red-600 mt-1">
                  {getFieldProps("piso").error}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Ala
              </label>
              <select
                {...register("ala")}
                className={getFieldProps("ala").className}
              >
                <option value="">-- Sin ala --</option>
                {ALA_OPCIONES.map((ala) => (
                  <option key={ala} value={ala}>
                    {ala}
                  </option>
                ))}
              </select>
              {getFieldProps("ala").error && (
                <p className="text-xs text-red-600 mt-1">
                  {getFieldProps("ala").error}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-all"
            >
              <FiSave className="mr-2 h-4 w-4" />
              Guardar Ubicación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
