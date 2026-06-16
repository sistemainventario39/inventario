import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import axios from "axios";
import {
  FiSave,
  FiX,
  FiMoreVertical,
  FiEye,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "../validators/userSchema";
import UserModal from "./Users/UserModal";
import { toast } from "react-hot-toast";

// Importación del selector de ubicación
import LocationSelector from "../components/ui/LocationSelector";

const inputClass = ({ hasError, isSuccess }) => `
  block w-full rounded-lg shadow-sm py-2 px-3 text-sm border transition-all duration-200 outline-none bg-white
  hover:border-gray-400
  ${
    hasError
      ? "border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-500 placeholder-red-300"
      : isSuccess
        ? "border-green-400 focus:ring-2 focus:ring-green-200 focus:border-green-500"
        : "border-gray-300 focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
  }
`;

export default function RegistroUsuarios() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getFieldState,
    reset,
    watch,
    setValue,
    getValues,
    clearErrors,
  } = useForm({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    defaultValues: {
      cedula: "",
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      usuario: "",
      password: "",
      rol: "",
      region: "",
      city: "",
      estado: "",
      sede: "",
      piso: "",
    },
  });

  const [users, setUsers] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null,
    user: null,
  });

  const formValues = watch();

  // Sincroniza los cambios del componente LocationSelector con react-hook-form
  const handleSetFormData = (updater) => {
    const nextValues =
      typeof updater === "function" ? updater(formValues) : updater;

    Object.entries(nextValues).forEach(([key, value]) => {
      // Obtenemos el valor que tiene actualmente el formulario
      const currentValue = getValues(key);

      // Solo obligamos a validar si el nuevo valor es diferente al actual
      const cambioElValor = currentValue !== value;

      setValue(key, value, {
        shouldValidate: cambioElValor,
        shouldDirty: true,
      });
    });
  };

  //Función para borrar rapidamente la sede en ubicación.
  const handleKeyDown = (e) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
    }
  };

  // Limpia manualmente los errores visuales de ubicación al seleccionar un piso
  useEffect(() => {
    if (formValues.piso) {
      clearErrors(["region", "estado", "city", "sede", "piso"]);
    }
  }, [formValues.piso, clearErrors]);

  const handleDefaultLocation = () => {};

  const toggleDropdown = (cedula) => {
    if (activeDropdown === cedula) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(cedula);
    }
  };

  const handleOpenModal = (type, user) => {
    setModalConfig({ isOpen: true, type, user });
    setActiveDropdown(null);
  };

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false, type: null, user: null });
  };

  const obtenerUsuarios = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/usuarios", {
        withCredentials: true,
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

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

  const onSubmit = async (data) => {
    const payload = {
      region: String(data.region) || null,
      estado: String(data.estado) || null,
      ciudad: String(data.city || data.id_ciudad) || null,
      sede: String(data.sede) || null,
      piso: String(data.piso) || null,
      username: data.usuario,
      password: data.password,
      rol: data.rol,
      cedula: data.cedula,
      nombre: data.nombre,
      apellido: data.apellido,
      correo: data.email,
      telefono: data.telefono,
      estado_persona: "activo",
    };
    console.log(payload);

    const peticionRegistro = axios.post(
      "http://localhost:3001/api/usuarios",
      payload,
    );

    toast.promise(peticionRegistro, {
      loading: "Registrando usuario...",
      success: (response) => {
        reset();
        obtenerUsuarios();
        return response.data.message || "Usuario registrado con éxito";
      },
      error: (error) => {
        return error.response?.data?.message || "Error al registrar el usuario";
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Crea usuarios y visualiza el listado de registrados.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Formulario */}
          <section>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="bg-primary-900 px-6 sm:px-8 py-5 sm:py-6 rounded-t-2xl">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Nuevo Usuario
                </h2>
                <p className="text-primary-100 text-sm mt-1">
                  Completa la información requerida para crear el acceso.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit, (erroresInvalidos) =>
                  console.log("Errores de Zod:", erroresInvalidos),
                )}
                className="p-4 sm:p-6 space-y-6"
              >
                {/* Cuadrícula principal de 3 columnas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start">
                  {/* FILA 1 */}
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Cédula <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="V-12345678"
                      {...register("cedula", {
                        onChange: (e) => {
                          const nums = e.target.value
                            .replace(/^V-?/, "")
                            .replace(/\D/g, "")
                            .slice(0, 8);
                          e.target.value = nums ? `V-${nums}` : "";
                        },
                        pattern: {
                          value: /^V-\d{1,8}$/,
                          message: "La cédula debe tener el formato V-12345678",
                        },
                      })}
                      className={getFieldProps("cedula").className}
                    />
                    {getFieldProps("cedula").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("cedula").error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre"
                      {...register("nombre")}
                      className={getFieldProps("nombre").className}
                    />
                    {getFieldProps("nombre").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("nombre").error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Apellido"
                      {...register("apellido")}
                      className={getFieldProps("apellido").className}
                    />
                    {getFieldProps("apellido").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("apellido").error}
                      </p>
                    )}
                  </div>

                  {/* FILA 2 */}
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="04XX-XXXXXXX"
                      {...register("telefono")}
                      className={getFieldProps("telefono").className}
                    />
                    {getFieldProps("telefono").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("telefono").error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Usuario <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Usuario"
                      {...register("usuario")}
                      className={getFieldProps("usuario").className}
                    />
                    {getFieldProps("usuario").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("usuario").error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Rol <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("rol")}
                      className={getFieldProps("rol").className}
                    >
                      <option value="" disabled>
                        -- Selecciona --
                      </option>
                      <option value="Superadministrador">
                        Superadministrador
                      </option>
                      <option value="Administrador">Administrador</option>
                      <option value="Visualizador">Visualizador</option>
                    </select>
                    {getFieldProps("rol").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("rol").error}
                      </p>
                    )}
                  </div>

                  {/* FILA 3: Totalmente nivelada en la misma línea */}
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="nombre.apellido@cantv.com"
                      {...register("email")}
                      className={getFieldProps("email").className}
                    />
                    {getFieldProps("email").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("email").error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      {...register("password")}
                      className={getFieldProps("password").className}
                    />
                    {getFieldProps("password").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("password").error}
                      </p>
                    )}
                    {!getFieldProps("password").error && (
                      <p className="text-xs text-gray-500 mt-1">
                        Mínimo 6 caracteres.
                      </p>
                    )}
                  </div>

                  {/* UBICACIÓN: Sin título azul superior, alineado al eje horizontal y sin botón de limpiar */}
                  <div
                    className="col-span-1 pb-7
                    [&>div>h3]:hidden [&>div]:p-0 [&>div]:bg-transparent
                    [&>div]:border-0 [&>div]:shadow-none
                    [&_label]:text-sm [&_label]:font-bold
                    [&_label]:text-black [&_label]:mb-2 [&_label]:block
                    [&_input]:w-full [&_input]:rounded-lg
                    [&_input]:border-gray-300 [&_input]:shadow-sm
                    [&_input]:py-2 [&_input]:px-3 [&_input]:text-sm
                    [&_button]:hidden
                    [&_.absolute]:z-50 [&_ul]:max-h-60
                    [&_ul]:overflow-y-auto"
                  >
                    <LocationSelector
                      title=""
                      radioGroupName="usuario_ubicacion_default"
                      formData={formValues}
                      setFormData={handleSetFormData}
                      onKeyDown={handleKeyDown}
                      handleDefaultLocation={handleDefaultLocation}
                      typePrefix=""
                    />

                    {/* Alerta de validación sin requerir el Ala */}
                    {(errors.region ||
                      errors.estado ||
                      errors.city ||
                      errors.sede ||
                      errors.piso) && (
                      <p className="text-xs text-red-600 mt-1 font-medium">
                        * Ubicación requerida.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => reset()}
                    className="w-full sm:w-auto group inline-flex items-center justify-center px-6 py-3 sm:py-2.5 border border-gray-300 shadow-sm text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-md"
                  >
                    <FiX className="mr-2 -ml-1 h-4 w-4 group-hover:text-red-600 transition-colors" />
                    Limpiar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 sm:py-2.5 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-md"
                  >
                    <FiSave className="mr-2 -ml-1 h-4 w-4" />
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Tabla */}
          <section>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="px-4 sm:px-8 py-5 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                <h2 className="text-lg font-bold text-gray-900">
                  Usuarios Registrados
                </h2>
              </div>

              <div className="block md:hidden divide-y divide-gray-200">
                {users.map((u) => (
                  <div
                    key={u.cedula}
                    className="p-4 bg-white flex flex-col gap-3 relative"
                  >
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">
                          Cédula:
                        </span>
                        <span className="text-sm font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                          {u.cedula}
                        </span>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(u.cedula)}
                          className="text-gray-400 hover:text-gray-900 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <FiMoreVertical className="w-5 h-5" />
                        </button>

                        {activeDropdown === u.cedula && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-[9999]">
                            <button
                              onClick={() => handleOpenModal("view", u)}
                              className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 first:rounded-t-xl"
                            >
                              <FiEye className="w-4 h-4" /> Ver más
                            </button>
                            <button
                              onClick={() => handleOpenModal("edit", u)}
                              className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FiEdit className="w-4 h-4" /> Editar
                            </button>
                            <button
                              onClick={() => handleOpenModal("delete", u)}
                              className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100 last:rounded-b-xl"
                            >
                              <FiTrash2 className="w-4 h-4" /> Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        Nombre Completo:
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {u.nombre} {u.apellido}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        Usuario:
                      </span>
                      <span className="text-sm text-gray-800">
                        {u.username}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        Sede:
                      </span>
                      <span className="text-sm text-gray-800">
                        {u.sede || "N/A"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        Correo:
                      </span>
                      <span className="text-sm text-gray-800 break-all">
                        {u.correo}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-sm font-medium text-gray-500">
                        Rol:
                      </span>
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize " +
                          (u.rol === "Superadministrador" ||
                          u.rol === "Superadmin"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-100 text-gray-700")
                        }
                      >
                        {u.rol}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block w-full rounded-b-2xl">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      {[
                        "Cédula",
                        "Nombre",
                        "Apellido",
                        "Usuario",
                        "Rol",
                        "Correo",
                        "Sede",
                      ].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr
                        key={u.cedula}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                          {u.cedula}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {u.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.apellido}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize " +
                              (u.rol === "Superadministrador" ||
                              u.rol === "Superadmin"
                                ? "bg-blue-50 text-blue-800"
                                : "bg-gray-100 text-gray-800")
                            }
                          >
                            {u.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.correo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.sede || "N/A"}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                          <button
                            onClick={() => toggleDropdown(u.cedula)}
                            className="text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <FiMoreVertical className="w-5 h-5 mx-auto" />
                          </button>

                          {activeDropdown === u.cedula && (
                            <div className="absolute right-12 top-0 w-40 bg-white rounded-xl shadow-xl border border-gray-200 z-[9999]">
                              <button
                                onClick={() => handleOpenModal("view", u)}
                                className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors first:rounded-t-xl"
                              >
                                <FiEye className="w-4 h-4" /> Ver más
                              </button>
                              <button
                                onClick={() => handleOpenModal("edit", u)}
                                className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                              >
                                <FiEdit className="w-4 h-4" /> Editar
                              </button>
                              <button
                                onClick={() => handleOpenModal("delete", u)}
                                className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-gray-100 last:rounded-b-xl"
                              >
                                <FiTrash2 className="w-4 h-4" /> Eliminar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Estado vacío */}
              {users.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-500 text-sm">
                  No hay usuarios registrados todavía.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <UserModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        user={modalConfig.user}
        type={modalConfig.type}
        onUserUpdated={obtenerUsuarios}
      />
    </div>
  );
}
