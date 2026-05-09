import React, { useMemo, useState, useEffect } from "react";
import Header from "../components/layout/Header";
import { FiSave, FiX } from "react-icons/fi";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {userSchema} from "../validators/userSchema";

const initialForm = {
  cedula: "",
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  usuario: "",
  password: "",
  rol: "",
  branch: "",
  piso: "",
  ala: "",
};

const seedUsers = [
  {
    id: 1,
    cedula: "V-12345678",
    nombre: "Juan",
    apellido: "Pérez",
    email: "juan.perez@cantv.com",
    telefono: "0414-1234567",
    usuario: "jperez",
    rol: "Admin",
    branch: "Torre 30",
    piso: "Piso 1",
    ala: "Ala sur",
  },
  {
    id: 2,
    cedula: "V-87654321",
    nombre: "María",
    apellido: "Gómez",
    email: "maria.gomez@cantv.com",
    telefono: "0424-7654321",
    usuario: "mgomez",
    rol: "Superadmin",
    branch: "Torre 30",
    piso: "Piso 1",
    ala: "Ala norte",
  },
];

const torresData = [
  { id: 1, nombre: "Barquisimeto Centro" },
  { id: 2, nombre: "Torre Lara" },
  { id: 3, nombre: "Torre 30" },
];

const inputClass = ({ hasError, isSuccess }) => `
  block w-60 rounded-lg shadow-sm py-2 px-3 text-sm border transition-all duration-200 outline-none bg-white
  hover:border-gray-400
  ${hasError 
    ? "border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-500 placeholder-red-300" 
    : isSuccess
      ? "border-green-400 focus:ring-2 focus:ring-green-200 focus:border-green-500"
    : "border-gray-300 focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
  }
`;

export default function RegistroUsuarios() {

  const { register,handleSubmit, formState: { errors }, getFieldState, watch, setValue, reset } = useForm({
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
      branch: "",
      piso: "",
      ala: ""
    }
  });

  const [users, setUsers] = useState(seedUsers);
  const [torres, setTorres] = useState(torresData);

  const selectedBranch = watch("branch");
  const selectedPiso = watch("piso");

  const piso = selectedBranch === "Barquisimeto Centro"
  ? [{ id: 1, nombre: "Piso 3" }]
      : selectedBranch === "Torre Lara"
        ? [{ id: 2, nombre: "Piso 1" }, { id: 3, nombre: "Piso 6" }]
            :[];
      

    const ala = selectedPiso === "Piso 1" || selectedPiso === "Piso 6"
    ? [{ id: 1, nombre: "Ala Norte" }, { id: 2, nombre: "Ala Sur" }]
        :[];

  useEffect(() => { setValue("piso", ""); setValue("ala", ""); }, [selectedBranch]);
  useEffect(() => { setValue("ala", ""); }, [selectedPiso,setValue]);

  const onSubmit = (data) => {
    setUsers((prev) => [
      { id: prev.length ? Math.max(...prev.map((u) => u.id)) + 1 : 1, ...data },
      ...prev,
    ]);
    reset();
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Registro de Usuarios
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Crea usuarios y visualiza el listado de registrados.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Formulario */}
          <section>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-primary-900 px-6 sm:px-8 py-5 sm:py-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Nuevo Usuario
                </h2>
                <p className="text-primary-100 text-sm mt-1">
                  Completa la información requerida para crear el acceso.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div >
                    <label className="block text-sm font-bold text-black mb-2">
                      Cédula <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="V-12345678"
                      {...register("cedula",
                        {onChange: (e) => {
                          const nums = e.target.value.replace(/^V-?/, "").replace(/\D/g, "").slice(0, 8);
                          e.target.value = nums ? `V-${nums}` : "";
                        },
                        pattern: {
                          value: /^V-\d{1,8}$/,
                          message: "La cédula debe tener el formato V-12345678"
                        }
                      }
                      )} className={getFieldProps("cedula").className}
                    />
                    {getFieldProps("cedula").error && <p className="text-xs text-red-600 mt-1">{getFieldProps("cedula").error}</p>} 
                  </div>

                  <div >
                    <label className="block text-sm font-bold text-black mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre"
                      {...register("nombre")} className={getFieldProps("nombre").className}
                    />
                    {getFieldProps("nombre").error && <p className="text-xs text-red-600 mt-1">{getFieldProps("nombre").error}</p>}
                  </div>

                  <div >
                    <label className="block text-sm font-bold text-black mb-2">
                      Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Apellido"
                      {...register("apellido")} className={getFieldProps("apellido").className}
                    />
                    {getFieldProps("apellido").error && <p className="text-xs text-red-600 mt-1">{getFieldProps("apellido").error}</p>}
                  </div>

                  <div >
                    <label className="block text-sm font-bold text-black mb-2">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="04XX-XXXXXXX"
                      {...register("telefono")} className={getFieldProps("telefono").className}
                    />
                    {getFieldProps("telefono").error && <p className="text-xs text-red-600 mt-1">{getFieldProps("telefono").error}</p>}
                  </div>

                  <div >
                    <label className="block text-sm font-bold text-black mb-2">
                      Usuario <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Usuario"
                      {...register("usuario")} className={getFieldProps("usuario").className}
                    />
                    {getFieldProps("usuario").error && <p className="text-xs text-red-600 mt-1">{getFieldProps("usuario").error}</p>}
                  </div>

                  <div >
                    <label className="block text-sm font-bold text-black mb-2">
                      Rol <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("rol")} className={getFieldProps("rol").className}
                    >
                      <option value="">-- Selecciona --</option>
                      <option value="Superadmin">Superadmin</option>
                      <option value="Admin">Admin</option>
                      <option value="Visualizador">Visualizador</option>
                    </select>
                    {getFieldProps("rol").error && <p className="text-xs text-red-600 mt-1">{getFieldProps("rol").error}</p>}
                  </div>

                  <div >
                    <label className="block text-sm font-bold text-black mb-2">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="nombre.apellido@cantv.com"
                      {...register("email")} className={getFieldProps("email").className}
                    />
                    {getFieldProps("email").error && <p className="text-xs text-red-600 mt-1">{getFieldProps("email").error}</p>}
                  </div>

                  <div >
                    <label className="block text-sm font-bold text-black mb-2">
                      Contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      {...register("password")} className={getFieldProps("password").className}
                    />
                    {getFieldProps("password").error && <p className="text-xs text-red-600 mt-1">{getFieldProps("password").error}</p>}
                    {!getFieldProps("password").error && (
                      <p className="text-xs text-gray-500 mt-1">
                        Mínimo 6 caracteres.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Torre o Centro <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("branch")} className={getFieldProps("branch").className}
                    >
                      <option value="">Seleccione Torre o Centro</option>
                      {torres.map((Tow) => (
                        <option key={Tow.id} value={Tow.nombre}>
                          {Tow.nombre}
                        </option>
                      ))}
                    </select>
                    {getFieldProps("branch").error && <p className="text-xs text-red-600 mt-1">{getFieldProps("branch").error}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Piso <span className="text-red-500">*</span>
                    </label>
                    <select
                    {...register("piso")} className={getFieldProps("piso").className}
                    >
                      <option value="">Seleccione Piso</option>
                      {piso.map((piso) => (
                        <option key={piso.id} value={piso.nombre}>
                          {piso.nombre}
                        </option>
                      ))}
                    </select>
                    {getFieldProps("piso").error && <p className="text-xs text-red-600 mt-1">{getFieldProps("piso").error}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Ala <span className="text-red-500">*</span>
                    </label>
                    <select
                    {...register("ala")} className={getFieldProps("ala").className}
                    >
                      <option value="">Seleccione Ala</option>
                      {ala.map((ala) => (
                        <option key={ala.id} value={ala.nombre}>
                          {ala.nombre}
                        </option>
                      ))}
                    </select>
                    {getFieldProps("ala").error && <p className="text-xs text-red-600 mt-1">{getFieldProps("ala").error}</p>}
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
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 sm:px-8 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">
                  Usuarios Registrados
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[768px] w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      {[
                        "Cédula",
                        "Nombre",
                        "Apellido",
                        "Teléfono",
                        "Usuario",
                        "Rol",
                        "Correo",
                        "Sede",
                        "Piso",
                        "Ala",
                      ].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                          {u.cedula}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {u.nombre}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.apellido}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.telefono}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.usuario}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span
                            className={
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold " +
                              (u.rol === "Superadmin"
                                ? "bg-primary-50 text-primary-800"
                                : "bg-gray-100 text-gray-800")
                            }
                          >
                            {u.rol}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.email}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.branch}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.piso}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.ala}
                        </td>
                      </tr>
                    ))}

                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No hay usuarios registrados todavía.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
