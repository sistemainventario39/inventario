import React, { useMemo, useState } from "react";
import Header from "../components/layout/Header";
import { FiSave, FiX } from "react-icons/fi";
import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userScheme } from "../validators/userSchema";
import { z } from "zod";

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

function validate(values) {
  const errors = {};

  const required = [
    "cedula",
    "nombre",
    "apellido",
    "email",
    "telefono",
    "usuario",
    "password",
    "rol",
    "branch",
    "piso",
    "ala",
  ];

  for (const key of required) {
    if (!String(values[key] ?? "").trim()) errors[key] = "Campo obligatorio.";
  }

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Correo inválido.";
  }

  if (values.password && String(values.password).length < 6) {
    errors.password = "Mínimo 6 caracteres.";
  }

  return errors;
}

function inputClass({ hasError, isSuccess }) {
  const base =
    "block w-60 rounded-lg shadow-sm py-2 px-3 text-sm border transition-all outline-none bg-white";
  const focus = "focus:ring-2 focus:ring-primary-500 focus:border-primary-500";
  const error = "border-red-300 focus:ring-red-500 focus:border-red-500";
  const success = "border-green-300 focus:ring-green-500 focus:border-green-500";
  const normal = "border-gray-300";
  return [base, focus, hasError ? error : isSuccess ? success : normal].join(" ");
}

export default function RegistroUsuarios() {
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [focused, setFocused] = useState(null);
  const [users, setUsers] = useState(seedUsers);

  const [region] = useState([
    { id: 1, nombre: 'Occidente' },
    { id: 2, nombre: 'Centro'},
    { id: 3, nombre: 'Llanos'},
  ]);

  const [torres, setTorres] = useState([]);
  const [piso, setPiso] = useState([]);
  const [ala, setAla  ] = useState([]);

<<<<<<< HEAD
  const manejarCambioRegion = (e) => {
    const regionNombre = e.target.value;
    setForm(prev => ({ ...prev, region: regionNombre, estado: '', city: '', branch: '' }));
    markTouched("region");
    if (regionNombre === 'Occidente') {
      setEstados([{ id: 1, nombre: 'Lara' }]);
    } else if (regionNombre === 'Centro') {
      setEstados([{ id: 2, nombre: 'Yaracuy' }]);
    } else if (regionNombre === 'Llanos') {
      setEstados([{ id: 3, nombre: 'Portuguesa' }]);
    } else {
      setEstados([]);
    }
  };

  const manejarCambioEstado = (e) => {
    const estadoNombre = e.target.value;
    setForm(prev => ({ ...prev, estado: estadoNombre, city: '' }));
    markTouched("estado");
    if (estadoNombre === 'Lara') {
      setCiudades([{ id: 1, nombre: 'Barquisimeto' }]);
    } else if (estadoNombre === 'Yaracuy') {
      setCiudades([{ id: 2, nombre: 'San Felipe' }]);
    } else if (estadoNombre === 'Portuguesa') {
      setCiudades([{ id: 3, nombre: 'Acarigua' }]);
    } else {
      setCiudades([]);
    }
  };

  const manejarCambioCiudad = (e) => {
    const ciudadNombre = e.target.value;
    setForm(prev => ({ ...prev, city: ciudadNombre, branch: '' }));
    markTouched("city");
    if (ciudadNombre === 'Barquisimeto') {
      setTorres([
        { id: 1, nombre: 'Barquisimeto Centro' },
        { id: 2, nombre: 'Torre Lara' }
      ]);
    } else if (ciudadNombre === 'San Felipe') {
      setTorres([{ id: 3, nombre: 'SF' }]);
    } else {
      setTorres([]);
    }
  };
=======
>>>>>>> c12c0146a7e1dbd42d1d577130038db43f0423df

    const manejarCambioTorre = (e) => {
    const torreNombre = e.target.value;
    setForm(prev => ({ ...prev, branch: torreNombre }));
    markTouched("branch");
    if (torreNombre === 'Barquisimeto Centro') {
      setPiso([
        { id: 1, nombre: 'Piso 1' }
      ]);
    } else if (torreNombre === 'Torre Lara') {
      setPiso([{ id: 2, nombre: 'Piso 1' }, { id: 3, nombre: 'Piso 6' }]);
    } else {
      setPiso([]);
    }
  };

    const manejarCambioPiso = (e) => {
    const pisoNombre = e.target.value;
    setForm(prev => ({ ...prev, piso: pisoNombre }));
    markTouched("piso");
    if (pisoNombre === 'Piso 1') {
      setAla([{ id: 1, nombre: 'Ala Norte', }, { id: 2, nombre: 'Ala Sur' }]);
    } else {
      setAla([]);
    }
  };

  const errors = useMemo(() => validate(form), [form]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  function markTouched(key) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  const getState = (key) => {
    const hasError = Boolean(touched[key] && errors[key]);
    const isSuccess =
      Boolean(touched[key]) && !errors[key] && String(form[key] ?? "").trim();
    const isFocused = focused === key;
    return { hasError, isSuccess, isFocused };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextTouched = Object.keys(initialForm).reduce((acc, k) => {
      acc[k] = true;
      return acc;
    }, {});
    setTouched(nextTouched);

    const currentErrors = validate(form);
    if (Object.keys(currentErrors).length > 0) return;

    setUsers((prev) => [
      {
        id: prev.length ? Math.max(...prev.map((u) => u.id)) + 1 : 1,
        cedula: form.cedula.trim(),
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        usuario: form.usuario.trim(),
        rol: form.rol,
        region: form.region,
        estado: form.estado,
        city: form.city,
        branch: form.branch,
        piso: form.piso,
        ala: form.ala,
      },
      ...prev,
    ]);

    setForm(initialForm);
    setTouched({});
    setFocused(null);
  };

  const handleReset = () => {
    setForm(initialForm);
    setTouched({});
    setFocused(null);
    setTorres([]);
    setPiso([]);
    setAla([]);
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

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-bold text-black mb-2">
                      Cédula <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="V-12345678"
                      value={form.cedula}
                      onChange={(e) => setField("cedula", e.target.value)}
                      onBlur={() => markTouched("cedula")}
                      onFocus={() => setFocused("cedula")}
                      onInput={() => focused !== "cedula" && setFocused("cedula")}
                      className={inputClass(getState("cedula"))}
                      aria-invalid={getState("cedula").hasError || undefined}
                    />
                    {getState("cedula").hasError && (
                      <p className="text-xs text-red-600 mt-1">{errors.cedula}</p>
                    )}
                    {getState("cedula").isFocused && !getState("cedula").hasError && (
                      <p className="text-xs text-gray-500 mt-1">
                        Incluye prefijo (ej: V- / E-).
                      </p>
                    )}
                  </div>


                  <div className="sm:col-span-1">
                    <label className="block text-sm font-bold text-black mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={form.nombre}
                      onChange={(e) => setField("nombre", e.target.value)}
                      onBlur={() => markTouched("nombre")}
                      onFocus={() => setFocused("nombre")}
                      className={inputClass(getState("nombre"))}
                      aria-invalid={getState("nombre").hasError || undefined}
                    />
                    {getState("nombre").hasError && (
                      <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-bold text-black mb-2">
                      Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Apellido"
                      value={form.apellido}
                      onChange={(e) => setField("apellido", e.target.value)}
                      onBlur={() => markTouched("apellido")}
                      onFocus={() => setFocused("apellido")}
                      className={inputClass(getState("apellido"))}
                      aria-invalid={getState("apellido").hasError || undefined}
                    />
                    {getState("apellido").hasError && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.apellido}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-bold text-black mb-2">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="04XX-XXXXXXX"
                      value={form.telefono}
                      onChange={(e) => setField("telefono", e.target.value)}
                      onBlur={() => markTouched("telefono")}
                      onFocus={() => setFocused("telefono")}
                      className={inputClass(getState("telefono"))}
                      aria-invalid={getState("telefono").hasError || undefined}
                    />
                    {getState("telefono").hasError && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.telefono}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-bold text-black mb-2">
                      Usuario <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Usuario"
                      value={form.usuario}
                      onChange={(e) => setField("usuario", e.target.value)}
                      onBlur={() => markTouched("usuario")}
                      onFocus={() => setFocused("usuario")}
                      className={inputClass(getState("usuario"))}
                      aria-invalid={getState("usuario").hasError || undefined}
                    />
                    {getState("usuario").hasError && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.usuario}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-bold text-black mb-2">
                      Rol <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.rol}
                      onChange={(e) => setField("rol", e.target.value)}
                      onBlur={() => markTouched("rol")}
                      onFocus={() => setFocused("rol")}
                      className={inputClass(getState("rol")) + " cursor-pointer"}
                      aria-invalid={getState("rol").hasError || undefined}
                    >
                      <option value="">-- Selecciona --</option>
                      <option value="Superadmin">Superadmin</option>
                      <option value="Admin">Admin</option>
                      <option value="Admin">Visualizador</option>
                    </select>
                    {getState("rol").hasError && (
                      <p className="text-xs text-red-600 mt-1">{errors.rol}</p>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-bold text-black mb-2">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="nombre.apellido@cantv.com"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      onBlur={() => markTouched("email")}
                      onFocus={() => setFocused("email")}
                      className={inputClass(getState("email"))}
                      aria-invalid={getState("email").hasError || undefined}
                    />
                    {getState("email").hasError && (
                      <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-bold text-black mb-2">
                      Contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setField("password", e.target.value)}
                      onBlur={() => markTouched("password")}
                      onFocus={() => setFocused("password")}
                      className={inputClass(getState("password"))}
                      aria-invalid={getState("password").hasError || undefined}
                    />
                    {getState("password").hasError ? (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.password}
                      </p>
                    ) : (
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
                      disabled={torres.length === 0}
                      required
                      className="w-60 border-gray-300 rounded-lg py-2 px-3 border outline-none bg-white focus:ring-2 focus:ring-primary-500"
                      value={form.branch}
                      onChange={manejarCambioTorre}
                    >
                      <option value="">
                        Seleccione Torre o Centro
                      </option>
                      {torres.map(Tow => (
                        <option key={Tow.id} value={Tow.nombre}>{Tow.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Piso <span className="text-red-500">*</span>
                    </label>
                    <select
                      type="text"
                      disabled={piso.length === 0}
                      required
                      placeholder="Ej: Piso 1"
                      className="w-60 bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.piso}
                      onChange={manejarCambioPiso}
                    >
                        <option value="">
                        Seleccione Piso
                      </option>
                      {piso.map(piso => (
                        <option key={piso.id} value={piso.nombre}>{piso.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Ala <span className="text-red-500">*</span>
                    </label>
                    <select
                      type="text"
                      disabled={ala.length === 0}
                      required
                      placeholder="Ej: Seleccione Ala Norte"
                      className="w-60 bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.ala}
                      onChange={(e) => {
                        setForm({ ...form, ala: e.target.value });
                        markTouched("ala");
                      }}
                    >
                      <option value="" disabled>
                        Seleccione Ala
                      </option>
                      {ala.map(ala => (
                        <option key={ala.id} value={ala.nombre}>{ala.nombre}</option>
                      ))}
                    </select>
                  </div>

                </div>

                <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="group inline-flex items-center justify-center px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-md"
                  >
                    <FiX className="mr-2 -ml-1 h-4 w-4 group-hover:text-red-600 transition-colors" />
                    Limpiar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-md"
                  >
                    <FiSave className="mr-2 -ml-1 h-4 w-4" />
                    Guardar Usuario
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Tabla */}
          <section>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 sm:px-8 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">
                  Usuarios Registrados
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full divide-y divide-gray-200">
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
                        "Ala"
                      ].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                          {u.telefono}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.usuario}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.branch}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.piso}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
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

