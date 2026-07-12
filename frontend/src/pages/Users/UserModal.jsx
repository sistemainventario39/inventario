import React, { useEffect } from "react";
import axios from "axios";
import {
  FiX,
  FiSave,
  FiTrash2,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
} from "react-icons/fi";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LocationSelector from "@/components/ui/LocationSelector";
import { userSchema } from "../../validators/userSchema";
import { toast } from "react-hot-toast";

export default function UserModal({
  isOpen,
  onClose,
  user,
  type,
  onUserUpdated,
}) {
  // =========================
  // REACT HOOK FORM
  // =========================
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors },
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
      ala: "",
    },
  });

  // =========================
  // WATCHS
  // =========================
  const formValues = watch();
  // =========================
  // UBICACIONES
  // =========================
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
  const handleDefaultLocation = () => {};
  const handleKeyDown = (e) => {
    // Si presiona la tecla de borrar (Backspace) o Suprimir (Delete)
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault(); // 🔥 Evita que borre letra por letra

      // Ejecuta la función que limpia todos los campos del formulario
    }
  };

  // =========================
  // CARGAR DATOS EN EL FORM
  useEffect(() => {
    if (user && type === "edit") {
      reset({
        cedula: user.cedula || "",
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        email: user.correo || "",
        telefono: user.telefono || "",
        usuario: user.username || "",
        password: "",
        rol: user.rol || "",

        region: user.id_region ? String(user.id_region) : "",
        estado: user.id_estado ? String(user.id_estado) : "",
        city: user.id_ciudad ? String(user.id_ciudad) : "",
        sede: user.id_sede ? String(user.id_sede) : "",
        piso: user.id_piso ? String(user.id_piso) : "",
        ala: user.id_ala ? String(user.id_ala) : "",
      });
    }
  }, [user, type, reset]);

  // =========================
  // EDITAR USUARIO
  // =========================
  const onSubmitEdit = async (data) => {
    const payload = {
      cedula: data.cedula,
      nombre: data.nombre,
      apellido: data.apellido,
      correo: data.email,
      telefono: data.telefono,

      username: data.usuario,
      password: data.password,
      rol: data.rol,

      region: String(data.region),
      estado: String(data.estado),
      ciudad: String(data.city),
      sede: String(data.sede),
      piso: String(data.piso),
      ala: String(data.ala),
    };

    const peticionEdicion = axios.put(
      `/api/usuarios/${user.id_usuario}`,
      payload,
      { withCredentials: true },  
    );

    toast.promise(peticionEdicion, {
      loading: "Editando usuario...",
      success: (response) => {
        if (onUserUpdated) onUserUpdated();
        onClose();
        return response.data.message || "Usuario editado con éxito";
      },
      error: (error) => {
        return error.response?.data?.message || "Error al editar el usuario";
      },
    });
  };

  // =========================
  // ELIMINAR
  // =========================
  const handleDelete = async () => {
    const peticionEliminacion = axios.put(
      `/api/usuarios/eliminado/${user.id_usuario}`,
      { withCredentials: true },
    );
    toast.promise(peticionEliminacion, {
      loading: "Eliminando usuario...",
      success: (response) => {
        if (onUserUpdated) onUserUpdated();
        onClose();
        return response.data.message || "Usuario eliminado con éxito";
      },
      error: (error) => {
        return error.response?.data?.message || "Error al eliminar el usuario";
      },
    });
  };
  const ubicacionTexto = user
    ? `${user.sede || ""} - ${user.ciudad || ""} - Piso ${
        user.piso || ""
      }${user.alas ? ` - Ala ${user.alas}` : ""}`
    : "";
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[95vh] overflow-y-auto">
        {/* HEADER */}
        <div className="bg-primary-900 px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {type === "view" && "Detalles del Usuario"}
              {type === "edit" && "Editar Usuario"}
              {type === "delete" && "Eliminar Usuario"}
            </h2>

            <p className="text-primary-100 text-sm mt-1">
              {type === "view" && "Visualiza toda la información del usuario."}

              {type === "edit" &&
                "Actualiza los datos del usuario seleccionado."}

              {type === "delete" &&
                "Esta acción eliminará el usuario permanentemente."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded-xl p-2 transition-all"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* VIEW */}
        {type === "view" && (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* CARD */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <FiUser className="text-primary-600 w-5 h-5" />
                  <h3 className="font-bold text-gray-800">
                    Información Personal
                  </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <p>
                    <span className="font-bold">Cédula:</span> {user.cedula}
                  </p>

                  <p>
                    <span className="font-bold">Nombre:</span> {user.nombre}
                  </p>

                  <p>
                    <span className="font-bold">Apellido:</span> {user.apellido}
                  </p>
                </div>
              </div>

              {/* CARD */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <FiShield className="text-primary-600 w-5 h-5" />
                  <h3 className="font-bold text-gray-800">
                    Información de Acceso
                  </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <p>
                    <span className="font-bold">Usuario:</span> {user.username}
                  </p>

                  <p>
                    <span className="font-bold">Rol:</span> {user.rol}
                  </p>
                </div>
              </div>

              {/* CARD */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <FiMail className="text-primary-600 w-5 h-5" />
                  <h3 className="font-bold text-gray-800">Contacto</h3>
                </div>

                <div className="space-y-3 text-sm">
                  <p>
                    <span className="font-bold">Correo:</span> {user.correo}
                  </p>

                  <p>
                    <span className="font-bold">Teléfono:</span> {user.telefono}
                  </p>
                </div>
              </div>

              {/* CARD */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <FiMapPin className="text-primary-600 w-5 h-5" />
                  <h3 className="font-bold text-gray-800">Ubicación</h3>
                </div>

                <div className="space-y-3 text-sm">
                  <p>
                    <span className="font-bold">Región:</span>{" "}
                    {user.region || "N/A"}
                  </p>

                  <p>
                    <span className="font-bold">Estado:</span>{" "}
                    {user.estado || "N/A"}
                  </p>

                  <p>
                    <span className="font-bold">Ciudad:</span>{" "}
                    {user.ciudad || "N/A"}
                  </p>

                  <p>
                    <span className="font-bold">Sede:</span>{" "}
                    {user.sede || "N/A"}
                  </p>

                  <p>
                    <span className="font-bold">Piso:</span> {user.piso || " "}
                  </p>

                  <p>
                    <span className="font-bold">Ala:</span> {user.alas || " "}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDIT */}
        {type === "edit" && (
          <form
            onSubmit={handleSubmit(onSubmitEdit, (erroresValidacion) =>
              console.log("Errores de Zod:", erroresValidacion),
            )}
            className="p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* INPUTS */}
              <div>
                <label className="block text-sm font-bold mb-2">Cédula</label>

                <input
                  {...register("cedula")}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                />

                {errors.cedula && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cedula.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Nombre</label>

                <input
                  {...register("nombre")}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                />

                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Apellido</label>

                <input
                  {...register("apellido")}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                />

                {errors.apellido && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.apellido.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Correo</label>

                <input
                  {...register("email")}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                />

                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Teléfono</label>

                <input
                  {...register("telefono")}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                />

                {errors.telefono && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.telefono.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Usuario</label>

                <input
                  {...register("usuario")}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                />

                {errors.usuario && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.usuario.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Contraseña
                </label>

                <input
                  type="password"
                  {...register("password")}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                />

                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Rol</label>

                <select
                  {...register("rol")}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Superadministrador">Superadministrador</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Visualizador">Visualizador</option>
                </select>
              </div>

              {/* UBICACIONES */}

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

            {/* BOTONES */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-100 transition-all"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg"
              >
                <FiSave />
                Guardar Cambios
              </button>
            </div>
          </form>
        )}

        {/* DELETE */}
        {type === "delete" && (
          <div className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-5 rounded-full mb-5">
                <FiTrash2 className="w-10 h-10 text-red-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                ¿Eliminar Usuario?
              </h3>

              <p className="text-gray-600 max-w-md">
                El usuario{" "}
                <strong>
                  {user.nombre} {user.apellido}
                </strong>{" "}
                será eliminado del sistema.
              </p>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg"
                >
                  <FiTrash2 />
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
