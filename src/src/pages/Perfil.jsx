import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/layout/Header";
import axios from "axios";
import {
  FiMail,
  FiShield,
  FiEdit2,
  FiSave,
  FiX,
  FiUser,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "../validators/userSchema";
import { toast } from "react-hot-toast";
import LocationSelector from "../components/ui/LocationSelector";
import { availableIcons } from "../utils/avatars";

const inputClass = ({ hasError, isSuccess, disabled }) => `
  block w-full rounded-lg shadow-sm py-2 px-3 text-sm border transition-all duration-200 outline-none
  ${disabled ? "bg-gray-100 text-gray-600 cursor-not-allowed" : "bg-white hover:border-gray-400"}
  ${
    hasError
      ? "border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-500 placeholder-red-300"
      : isSuccess
        ? "border-green-400 focus:ring-2 focus:ring-green-200 focus:border-green-500"
        : "border-gray-300 focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
  }
`;

function mapUserToForm(user) {
  const ubi = user.ubicacion || {};
  return {
    cedula: user.cedula || "",
    nombre: user.nombre || "",
    apellido: user.apellido || "",
    email: user.correo || "",
    telefono: user.telefono || "",
    usuario: user.username || "",
    password: "",
    rol: user.rol || "",
    region: ubi.region ? String(ubi.region) : "",
    estado: ubi.estado ? String(ubi.estado) : "",
    city: ubi.ciudad ? String(ubi.ciudad) : "",
    sede: ubi.sede ? String(ubi.sede) : "",
    piso: ubi.piso ? String(ubi.piso) : "",
    ala: ubi.ala ? String(ubi.ala) : "",
  };
}

export default function Perfil() {
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [selectedIconId, setSelectedIconId] = useState(() => {
    const savedAvatar = localStorage.getItem("selectedAvatarId");
    return savedAvatar ? Number(savedAvatar) : 1;
  });
  const [profileUser, setProfileUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

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
      ala: "",
    },
  });

  const formValues = watch();

  const handleSetFormData = (updater) => {
    const nextValues =
      typeof updater === "function" ? updater(formValues) : updater;

    Object.entries(nextValues).forEach(([key, value]) => {
      const currentValue = getValues(key);
      const cambioElValor = currentValue !== value;

      setValue(key, value, {
        shouldValidate: cambioElValor,
        shouldDirty: true,
      });
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
    }
  };

  const handleDefaultLocation = () => {};

  const fetchProfile = useCallback(async () => {
    try {
      const response = await axios.get(`/api/usuarios/me`, {
        withCredentials: true,
      });

      const user = response.data.user;
      setProfileUser(user);
      reset(mapUserToForm(user));
    } catch (error) {
      console.error("Error cargando perfil:", error);
      toast.error(
        error.response?.data?.message || "No se pudo cargar tu perfil.",
      );
    } finally {
      setLoadingProfile(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (formValues.piso) {
      clearErrors(["region", "estado", "city", "sede", "piso"]);
    }
  }, [formValues.piso, clearErrors]);

  const camposBloqueados = true;

  const getFieldProps = (name, { editable = false } = {}) => {
    const state = getFieldState(name);
    const locked = camposBloqueados && !editable;
    const isDisabled = locked || loadingProfile;
    return {
      disabled: isDisabled,
      readOnly: locked && editable === false,
      className: inputClass({
        hasError: state.invalid,
        isSuccess: state.isDirty && !state.invalid,
        disabled: isDisabled,
      }),
      error: state.invalid ? errors[name]?.message : null,
    };
  };

  const onSubmit = async (data) => {
    if (!profileUser?.id) {
      toast.error("No se encontró el identificador del usuario.");
      return;
    }

    localStorage.setItem("selectedAvatarId", selectedIconId);
    window.dispatchEvent(new Event("avatarUpdated"));

    const ubi = profileUser.ubicacion || {};

    const payload = camposBloqueados
      ? {
          cedula: profileUser.cedula,
          nombre: profileUser.nombre,
          apellido: profileUser.apellido,
          correo: profileUser.correo,
          telefono: profileUser.telefono,
          username: profileUser.username,
          password: data.password,
          rol: profileUser.rol,
          region: ubi.region ? String(ubi.region) : null,
          estado: ubi.estado ? String(ubi.estado) : null,
          ciudad: ubi.ciudad ? String(ubi.ciudad) : null,
          sede: ubi.sede ? String(ubi.sede) : null,
          piso: ubi.piso ? String(ubi.piso) : null,
          alas: ubi.ala ? String(ubi.ala) : "",
        }
      : {
          cedula: data.cedula,
          nombre: data.nombre,
          apellido: data.apellido,
          correo: data.email,
          telefono: data.telefono,
          username: data.usuario,
          password: data.password,
          rol: data.rol,
          region: String(data.region) || null,
          estado: String(data.estado) || null,
          ciudad: String(data.city) || null,
          sede: String(data.sede) || null,
          piso: String(data.piso) || null,
          alas: String(data.ala || ""),
        };

    const peticion = axios.put(`/api/usuarios/${profileUser.id}`, payload, {
      withCredentials: true,
    });

    toast.promise(peticion, {
      loading: "Guardando cambios...",
      success: (response) => {
        fetchProfile();
        return response.data.message || "Perfil actualizado con éxito";
      },
      error: (error) =>
        error.response?.data?.message || "Error al actualizar el perfil",
    });
  };

  const handleResetForm = () => {
    if (profileUser) {
      reset(mapUserToForm(profileUser));
    }
  };

  const SelectedIcon =
    availableIcons.find((icon) => icon.id === selectedIconId)?.icon || FiUser;
  const SelectedIconColor =
    availableIcons.find((icon) => icon.id === selectedIconId)?.color ||
    "text-gray-400";

  const nombreCompleto = profileUser
    ? `${profileUser.nombre || ""} ${profileUser.apellido || ""}`.trim()
    : "Cargando...";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {showIconSelector && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">
                    Selecciona tu Avatar
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowIconSelector(false)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 grid grid-cols-4 gap-4">
                  {availableIcons.map((item) => {
                    const IconComponent = item.icon;
                    const isSelected = item.id === selectedIconId;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedIconId(item.id);
                          setShowIconSelector(false);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 group ${
                          isSelected
                            ? "border-primary-500 bg-primary-50 shadow-sm"
                            : "border-transparent hover:bg-gray-50 hover:border-gray-200"
                        }`}
                        title={item.name}
                      >
                        <IconComponent
                          className={`w-8 h-8 ${item.color} group-hover:scale-110 transition-transform`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-primary-600 h-24" />
              <div className="px-6 pb-6 relative">
                <div className="relative inline-block -mt-12 mb-4">
                  <button
                    type="button"
                    className="h-24 w-24 rounded-full border-4 border-white bg-white overflow-hidden flex items-center justify-center relative group cursor-pointer shadow-md hover:shadow-lg transition-all"
                    onClick={() => setShowIconSelector(true)}
                  >
                    <SelectedIcon
                      className={`${SelectedIconColor} w-12 h-12`}
                    />
                    <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex cursor-pointer transition-all rounded-full">
                      <FiEdit2 className="text-white w-5 h-5" />
                    </div>
                  </button>
                </div>

                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-bold text-gray-900">
                    {loadingProfile ? "Cargando..." : nombreCompleto}
                  </h2>
                  <p className="text-sm font-medium text-primary-600 mb-4 whitespace-nowrap">
                    {profileUser?.rol || "—"}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiMail className="mr-3 text-gray-400 shrink-0" />
                      <span className="break-all">
                        {profileUser?.correo || "—"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiShield className="mr-3 text-green-500 shrink-0" />
                      {profileUser?.ubicacion?.sede || "Sin sede asignada"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-primary-900 px-6 sm:px-8 py-5 sm:py-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Editar Perfil
              </h2>
              <p className="text-primary-100 text-sm mt-1">
                Actualiza tu información personal y ubicación de trabajo.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit, (erroresInvalidos) =>
                console.log("Errores de Zod:", erroresInvalidos),
              )}
              className="p-4 sm:p-6 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start">
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Cédula <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="V-12345678"
                    {...getFieldProps("cedula")}
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
                    {...getFieldProps("nombre")}
                    {...register("nombre")}
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
                    {...getFieldProps("apellido")}
                    {...register("apellido")}
                  />
                  {getFieldProps("apellido").error && (
                    <p className="text-xs text-red-600 mt-1">
                      {getFieldProps("apellido").error}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="04XX-XXXXXXX"
                    {...getFieldProps("telefono")}
                    {...register("telefono")}
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
                    {...getFieldProps("usuario")}
                    {...register("usuario")}
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
                  <select {...getFieldProps("rol")} {...register("rol")}>
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

                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="nombre.apellido@cantv.com"
                    {...getFieldProps("email")}
                    {...register("email")}
                  />
                  {getFieldProps("email").error && (
                    <p className="text-xs text-red-600 mt-1">
                      {getFieldProps("email").error}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Dejar vacío para no cambiar"
                      {...getFieldProps("password", { editable: true })}
                      {...register("password")}
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
                    radioGroupName="perfil_ubicacion_default"
                    formData={formValues}
                    setFormData={handleSetFormData}
                    onKeyDown={handleKeyDown}
                    handleDefaultLocation={handleDefaultLocation}
                    typePrefix=""
                    disabled={camposBloqueados}
                  />

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
                  onClick={handleResetForm}
                  disabled={loadingProfile || !profileUser}
                  className="w-full sm:w-auto group inline-flex items-center justify-center px-6 py-3 sm:py-2.5 border border-gray-300 shadow-sm text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-md disabled:opacity-50"
                >
                  <FiX className="mr-2 -ml-1 h-4 w-4 group-hover:text-red-600 transition-colors" />
                  Restaurar
                </button>
                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 sm:py-2.5 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-md disabled:opacity-50"
                >
                  <FiSave className="mr-2 -ml-1 h-4 w-4" />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
