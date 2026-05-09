import React, {useState,useEffect} from 'react';
import Header from '../components/layout/Header';
import { FiUser, FiMail, FiShield, FiSettings, FiLogOut, FiEdit2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {userSchema} from "../validators/userSchema";
import { FiSave, FiX } from "react-icons/fi";
import { FaUser, FaUserAstronaut, FaUserTie, FaUserNinja, FaUserGraduate, FaUserSecret, FaRobot, FaGhost } from 'react-icons/fa';
import { GiNinjaHead, GiPirateFlag, GiCowboyBoot } from 'react-icons/gi';
import { BsPersonBadge, BsPersonHeart, BsPersonWorkspace } from 'react-icons/bs';

const availableIcons = [
  { id: 1, icon: FiUser, name: "Usuario Básico", color: "text-gray-400" },
  { id: 2, icon: FaUser, name: "Usuario Clásico", color: "text-blue-400" },
  { id: 3, icon: FaUserAstronaut, name: "Astronauta", color: "text-purple-400" },
  { id: 4, icon: FaUserTie, name: "Ejecutivo", color: "text-indigo-400" },
  { id: 5, icon: FaUserNinja, name: "Ninja", color: "text-red-400" },
  { id: 6, icon: FaUserGraduate, name: "Graduado", color: "text-green-400" },
  { id: 7, icon: FaUserSecret, name: "Agente Secreto", color: "text-gray-600" },
  { id: 8, icon: FaRobot, name: "Robot", color: "text-cyan-400" },
  { id: 9, icon: GiNinjaHead, name: "Ninja Head", color: "text-slate-400" },
  { id: 10, icon: BsPersonBadge, name: "Identificado", color: "text-emerald-400" },
  { id: 11, icon: BsPersonWorkspace, name: "Trabajador", color: "text-orange-400" },
];

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

const torresData = [
  { id: 1, nombre: "Barquisimeto Centro" },
  { id: 2, nombre: "Torre Lara" },
  { id: 3, nombre: "Torre 30" },
];

const inputClass = ({ hasError, isSuccess }) => `
  block w-full rounded-lg shadow-sm py-2 px-3 text-sm border transition-all duration-200 outline-none bg-white
  hover:border-gray-400
  ${hasError 
    ? "border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-500 placeholder-red-300" 
    : isSuccess
      ? "border-green-400 focus:ring-2 focus:ring-green-200 focus:border-green-500"
    : "border-gray-300 focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
  }
`;

export default function Perfil() {
  const navigate = useNavigate();
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [selectedIconId, setSelectedIconId] = useState(1);

  const handleLogout = () => {
    navigate('/login');
  };

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

const SelectedIcon = availableIcons.find(icon => icon.id === selectedIconId)?.icon || FiUser;
const SelectedIconColor = availableIcons.find(icon => icon.id === selectedIconId)?.color || "text-gray-400";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Modal Selector de Iconos */}
          {showIconSelector && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                
                {/* Cabecera del Modal */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">Selecciona tu Avatar</h3>
                  <button 
                    onClick={() => setShowIconSelector(false)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Cuadrícula de Iconos */}
                <div className="p-6 grid grid-cols-4 gap-4">
                  {availableIcons.map((item) => {
                    const IconComponent = item.icon;
                    const isSelected = item.id === selectedIconId;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedIconId(item.id);
                          setShowIconSelector(false);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 group ${
                          isSelected 
                            ? 'border-primary-500 bg-primary-50 shadow-sm' 
                            : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
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
          {/* Left Column: User Card */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-primary-600 h-24"></div>
              <div className="px-6 pb-6 relative">
                <div className="relative inline-block -mt-12 mb-4">
                  <div className="h-24 w-24 rounded-full border-4 border-white bg-white overflow-hidden flex items-center justify-center relative group cursor-pointer shadow-md hover:shadow-lg transition-all"
                    onClick={() => setShowIconSelector(true)}>
                    <SelectedIcon className={`${SelectedIconColor} w-12 h-12`} />
                    <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex cursor-pointer transition-all rounded-full">
                      <FiEdit2 className="text-white w-5 h-5" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-bold text-gray-900">Carlos Administrador</h2>
                  <p className="text-sm font-medium text-primary-600 mb-4 whitespace-nowrap">Director de Infraestructura IT</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiMail className="mr-3 text-gray-400" />
                      admin@empresa.com
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiShield className="mr-3 text-green-500" />
                      Permisos Totales (Root)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-primary-900 px-6 sm:px-8 py-5 sm:py-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Editar Perfil
                </h2>
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
        </div>
      </main>
    </div>
  );
}
