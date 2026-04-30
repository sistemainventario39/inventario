import React, { useState } from "react";
import Header from "../components/layout/Header";
import { FiSave, FiX } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";


export default function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Datos Generales
    name: "",
    model: "",
    serial: "",
    type: "",
    status: "Bueno",
    description: "",
    acquisitionDate: new Date(),

    // Componentes Internos
    ram: "",
    ramSerial: "",
    ramStatus: "Bueno",
    processor: "",
    processorStatus: "Bueno",
    storage: "",
    storageSerial: "",
    storageStatus: "Bueno",

    // Controladores de Periféricos (Checkboxes)
    hasMonitor: false,
    hasKeyboard: false,
    hasMouse: false,
    hasSpeakers: false,

    // Periféricos
    monitorBrand: "",
    monitorSerial: "",
    monitorStatus: "Bueno",
    keyboardBrand: "",
    keyboardSerial: "",
    keyboardStatus: "Bueno",
    mouseBrand: "",
    mouseSerial: "",
    mouseStatus: "Bueno",
    speakersBrand: "",
    speakersSerial: "",
    speakersStatus: "Bueno",

 // Procedencia 
    regionP: "",
    estadoP: "",
    cityP: "",
    branchP: "",
    pisoP: "",
    alaP: "",

    // Ubicación 
    region: "",
    estado: "",
    city: "",
    branch: "",
    piso: "",
    ala: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica de guardado a la API iría aquí
    navigate("/busqueda");
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const handleSearchSerial = (serialField, capacityField, statusField) => {
    const serialValue = formData[serialField];
    if (serialValue === "SN-EXISTENTE") {
      setFormData((prev) => ({
        ...prev,
        [capacityField]: "Asignado por Sistema",
        [statusField]: "Bueno",
      }));
    } else {
      alert(`Buscando en base de datos el serial: ${serialValue}`);
    }
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

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* SECCIÓN 1: Selector de Tipo */}
            <div className="flex flex-col items-center pb-8 border-b border-gray-100">
              <label
                htmlFor="type"
                className="block text-sm font-semibold text-primary-900 mb-3 uppercase tracking-wider"
              >
                ¿Qué tipo de equipo principal deseas registrar?
              </label>
              <select
                id="type"
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="block w-full max-w-md border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg border transition-all outline-none bg-white text-center cursor-pointer"
              >
                <option value="">-- Selecciona una opción --</option>
                <option value="CPU">CPU</option>
                <option value="Laptop">Laptop</option>
                <option value="Monitor">Monitor</option>
                <option value="Teclado">Teclado</option>
                <option value="Mouse">Mouse</option>
                <option value="Switch">Switch</option>
                <option value="Impresora">Impresora</option>
              </select>
            </div>

            {/* SECCIÓN 2: Campos Dinámicos */}
            {formData.type && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-8">
                {/* DATOS DEL EQUIPO PRINCIPAL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="col-span-full mb-2 border-b border-gray-200 pb-2">
                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                      Datos del Equipo Principal ({formData.type})
                    </h3>
                  </div>

                  {/* Modelo / Marca */}
                  <div className="col-span-full md:col-span-1">
                    <label className="block text-sm font-bold text-black mb-2">
                      Modelo / Marca <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="block w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-2 focus:ring-primary-500 text-base border outline-none bg-white cursor-pointer"
                    >
                      <option value="" disabled>
                        -- Selecciona la marca --
                      </option>
                      {formData.type !== "Switch" && (
                        <>
                          <option value="Vit">Vit</option>
                          <option value="Lenovo">Lenovo</option>
                        </>
                      )}
                      {formData.type === "Switch" && (
                        <>
                          <option value="Huawei">Huawei</option>
                          <option value="Cisco">Cisco</option>
                        </>
                      )}
                      <>
                        <option value="HP">HP</option>
                        <option value="Lexmark">Lexmark</option>
                        <option value="Dellcop">Dellcop</option>
                      </>
                    </select>
                  </div>

                  <div className="col-span-full md:col-span-1">
                    <label className="block text-sm font-bold text-black mb-2">
                      Modelo <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex flex-1">
                        <input
                          type="text"
                          required
                          className="block w-full border-gray-300 bg-white rounded-lg shadow-sm py-2 px-3 border outline-none font-mono focus:ring-primary-500 text-sm"
                          placeholder="Thinkpad X1 Carbon Gen 9..."
                          value={formData.model}
                          onChange={(e) =>
                            setFormData({ ...formData, model: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-full md:col-span-1">
                    <label className="block text-sm font-bold text-black mb-2">
                      Número de Serie (S/N) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 items-end">
                      <div className="relative flex flex-1">
                        <input
                          type="text"
                          required
                          className="block w-full border-gray-300 rounded-l-lg shadow-sm py-2 px-3 border outline-none font-mono focus:ring-primary-500 text-sm"
                          placeholder="SN-XXXXX-XXXX"
                          value={formData.serial}
                          onChange={(e) =>
                            setFormData({ ...formData, serial: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => handleSearchSerial("serial")}
                          className="bg-primary-600 text-white px-3 rounded-r-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                        >
                          <CiSearch size={20} />
                        </button>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="block text-sm font-bold text-black mb-0">
                          Estado <span className="text-red-500">*</span>
                        </label>
                        <div className="flex justify-around items-center bg-white border border-gray-300 shadow-sm rounded-lg py-1 px-3 w-[100px]">
                          <label className="flex items-center space-x-1 cursor-pointer group">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-green-600 rounded border-gray-300"
                              checked={formData.status === "Bueno"}
                              onChange={() =>
                                setFormData({ ...formData, status: "Bueno" })
                              }
                            />
                            <span className="text-[12px] font-bold text-black uppercase">
                              B
                            </span>
                          </label>
                          <div className="w-[1px] h-4 bg-gray-200 mx-2"></div>
                          <label className="flex items-center space-x-1 cursor-pointer group">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-red-600 rounded border-gray-300"
                              checked={formData.status === "Malo"}
                              onChange={() =>
                                setFormData({ ...formData, status: "Malo" })
                              }
                            />
                            <span className="text-[12px] font-bold text-black uppercase">
                              M
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COMPONENTES INTERNOS (Solo CPU / Laptop) */}
                {(formData.type === "CPU" || formData.type === "Laptop") && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">
                      Componentes Internos
                    </h3>

                    {/* Memoria RAM */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-6">
                        <label className="block text-xs font-bold text-black mb-1 uppercase">
                          Serial Memoria RAM
                        </label>
                        <div className="relative flex">
                          <input
                            type="text"
                            className="w-full border-gray-300 rounded-l-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-blue-400 font-mono"
                            placeholder="S/N RAM..."
                            value={formData.ramSerial}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                ramSerial: e.target.value,
                              })
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleSearchSerial(
                                "ramSerial",
                                "ram",
                                "ramStatus",
                              )
                            }
                            className="bg-primary-600 text-white px-3 rounded-r-md hover:bg-primary-700"
                          >
                            <CiSearch size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-black mb-1 uppercase">
                          Capacidad
                        </label>
                        <select
                          className="w-full border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                          value={formData.ram}
                          onChange={(e) =>
                            setFormData({ ...formData, ram: e.target.value })
                          }
                        >
                          <option value="">-- Seleccione --</option>
                          <option value="1GB DDR2">1GB DDR2</option>
                          <option value="2GB DDR2">2GB DDR2</option>
                          <option value="4GB DDR2">4GB DDR2</option>
                          <option value="1GB DDR3">1GB DDR3</option>
                          <option value="2GB DDR3">2GB DDR3</option>
                          <option value="4GB DDR3">4GB DDR3</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 flex justify-around items-center border border-gray-200 rounded-md py-1 px-2 h-[34px]">
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-green-600"
                            checked={formData.ramStatus === "Bueno"}
                            onChange={() =>
                              setFormData({ ...formData, ramStatus: "Bueno" })
                            }
                          />
                          <span className="text-[10px] font-bold">B</span>
                        </label>
                        <div className="w-[1px] h-4 bg-gray-200"></div>
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-red-600"
                            checked={formData.ramStatus === "Malo"}
                            onChange={() =>
                              setFormData({ ...formData, ramStatus: "Malo" })
                            }
                          />
                          <span className="text-[10px] font-bold">M</span>
                        </label>
                      </div>
                    </div>

                    {/* Disco Duro */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-6">
                        <label className="block text-xs font-bold text-black mb-1 uppercase">
                          Serial Disco Duro
                        </label>
                        <div className="relative flex">
                          <input
                            type="text"
                            className="w-full border-gray-300 rounded-l-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-blue-400 font-mono"
                            placeholder="S/N Disco..."
                            value={formData.storageSerial}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                storageSerial: e.target.value,
                              })
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleSearchSerial(
                                "storageSerial",
                                "storage",
                                "storageStatus",
                              )
                            }
                            className="bg-primary-600 text-white px-3 rounded-r-md hover:bg-primary-700"
                          >
                            <CiSearch size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-black mb-1 uppercase">
                          Capacidad
                        </label>
                        <select
                          className="w-full border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                          value={formData.storage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              storage: e.target.value,
                            })
                          }
                        >
                          <option value="">-- Seleccione --</option>
                          <option value="120GB HDD">120GB HDD</option>
                          <option value="250GB HDD">250GB HDD</option>
                          <option value="500GB HDD">500GB HDD</option>
                          <option value="1TB HDD">1TB HDD</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 flex justify-around items-center border border-gray-200 rounded-md py-1 px-2 h-[34px]">
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-green-600"
                            checked={formData.storageStatus === "Bueno"}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                storageStatus: "Bueno",
                              })
                            }
                          />
                          <span className="text-[10px] font-bold">B</span>
                        </label>
                        <div className="w-[1px] h-4 bg-gray-200"></div>
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-red-600"
                            checked={formData.storageStatus === "Malo"}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                storageStatus: "Malo",
                              })
                            }
                          />
                          <span className="text-[10px] font-bold">M</span>
                        </label>
                      </div>
                    </div>

                    {/* Procesador */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-10">
                        <label className="block text-xs font-bold text-black mb-1 uppercase">
                          Procesador
                        </label>
                        <select
                          value={formData.processor}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              processor: e.target.value,
                            })
                          }
                          className="w-full border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-blue-400 bg-white cursor-pointer"
                        >
                          <option value="">-- Seleccionar Procesador --</option>
                          <option value="Intel Core 2 Duo">
                            Intel Core 2 Duo
                          </option>
                          <option value="Intel Pentium Dual-Core">
                            Intel Pentium Dual-Core
                          </option>
                          <option value="Intel Core i3">Intel Core i3</option>
                          <option value="Intel Core i5">Intel Core i5</option>
                          <option value="Intel Core i7">Intel Core i7</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 flex justify-around items-center border border-gray-200 rounded-md py-1 px-2 h-[34px]">
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-green-600"
                            checked={formData.processorStatus === "Bueno"}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                processorStatus: "Bueno",
                              })
                            }
                          />
                          <span className="text-[10px] font-bold">B</span>
                        </label>
                        <div className="w-[1px] h-4 bg-gray-200"></div>
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-red-600"
                            checked={formData.processorStatus === "Malo"}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                processorStatus: "Malo",
                              })
                            }
                          />
                          <span className="text-[10px] font-bold">M</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* PERIFÉRICOS ASIGNADOS */}
                {(formData.type === "CPU" || formData.type === "Laptop") && (
                  <div className="space-y-4 pt-4">
                    <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest border-b border-purple-100 pb-2">
                      Periféricos Asignados a esta Torre
                    </h3>

                    {/* Monitor */}
                    <div className="bg-purple-50/30 p-4 rounded-xl border border-purple-100 shadow-sm flex flex-col gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer w-fit">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-purple-600 rounded border-gray-300"
                          checked={formData.hasMonitor}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hasMonitor: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm font-bold text-purple-800 uppercase tracking-wide">
                          Incluir Monitor
                        </span>
                      </label>

                      {formData.hasMonitor && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in duration-300">
                          <div className="md:col-span-6">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Serial del Monitor
                            </label>
                            <div className="relative flex">
                              <input
                                type="text"
                                className="w-full border-gray-300 rounded-l-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-purple-400 font-mono"
                                placeholder="S/N Monitor..."
                                value={formData.monitorSerial}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    monitorSerial: e.target.value,
                                  })
                                }
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleSearchSerial(
                                    "monitorSerial",
                                    "monitorBrand",
                                    "monitorStatus",
                                  )
                                }
                                className="bg-purple-600 text-white px-3 rounded-r-md hover:bg-purple-700"
                              >
                                <CiSearch size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Marca
                            </label>
                            <select
                              className="w-full border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-purple-400"
                              value={formData.monitorBrand}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  monitorBrand: e.target.value,
                                })
                              }
                            >
                              <option value="" disabled>
                                -- Selecciona la marca --
                              </option>
                              <option value="Vit">Vit</option>
                              <option value="Lenovo">Lenovo</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>
                          <div className="md:col-span-2 flex justify-around items-center border border-gray-200 bg-white rounded-md py-1 px-2 h-[34px]">
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-green-600"
                                checked={formData.monitorStatus === "Bueno"}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    monitorStatus: "Bueno",
                                  })
                                }
                              />
                              <span className="text-[10px] font-bold">B</span>
                            </label>
                            <div className="w-[1px] h-4 bg-gray-200"></div>
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-red-600"
                                checked={formData.monitorStatus === "Malo"}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    monitorStatus: "Malo",
                                  })
                                }
                              />
                              <span className="text-[10px] font-bold">M</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Teclado */}
                    <div className="bg-purple-50/30 p-4 rounded-xl border border-purple-100 shadow-sm flex flex-col gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer w-fit">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-purple-600 rounded border-gray-300"
                          checked={formData.hasKeyboard}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hasKeyboard: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm font-bold text-purple-800 uppercase tracking-wide">
                          Incluir Teclado
                        </span>
                      </label>

                      {formData.hasKeyboard && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in duration-300">
                          <div className="md:col-span-6">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Serial del Teclado
                            </label>
                            <div className="relative flex">
                              <input
                                type="text"
                                className="w-full border-gray-300 rounded-l-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-purple-400 font-mono"
                                placeholder="S/N Teclado..."
                                value={formData.keyboardSerial}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    keyboardSerial: e.target.value,
                                  })
                                }
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleSearchSerial(
                                    "keyboardSerial",
                                    "keyboardBrand",
                                    "keyboardStatus",
                                  )
                                }
                                className="bg-purple-600 text-white px-3 rounded-r-md hover:bg-purple-700"
                              >
                                <CiSearch size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Marca
                            </label>
                            <select
                              className="w-full border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-purple-400"
                              value={formData.keyboardBrand}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  keyboardBrand: e.target.value,
                                })
                              }
                            >
                              <option value="" disabled>
                                -- Selecciona la marca --
                              </option>
                              <option value="Vit">Vit</option>
                              <option value="Lenovo">Lenovo</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>
                          <div className="md:col-span-2 flex justify-around items-center border border-gray-200 bg-white rounded-md py-1 px-2 h-[34px]">
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-green-600"
                                checked={formData.keyboardStatus === "Bueno"}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    keyboardStatus: "Bueno",
                                  })
                                }
                              />
                              <span className="text-[10px] font-bold">B</span>
                            </label>
                            <div className="w-[1px] h-4 bg-gray-200"></div>
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-red-600"
                                checked={formData.keyboardStatus === "Malo"}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    keyboardStatus: "Malo",
                                  })
                                }
                              />
                              <span className="text-[10px] font-bold">M</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mouse */}
                    <div className="bg-purple-50/30 p-4 rounded-xl border border-purple-100 shadow-sm flex flex-col gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer w-fit">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-purple-600 rounded border-gray-300"
                          checked={formData.hasMouse}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hasMouse: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm font-bold text-purple-800 uppercase tracking-wide">
                          Incluir Mouse
                        </span>
                      </label>

                      {formData.hasMouse && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in duration-300">
                          <div className="md:col-span-6">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Serial del Mouse
                            </label>
                            <div className="relative flex">
                              <input
                                type="text"
                                className="w-full border-gray-300 rounded-l-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-purple-400 font-mono"
                                placeholder="S/N Mouse..."
                                value={formData.mouseSerial}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    mouseSerial: e.target.value,
                                  })
                                }
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleSearchSerial(
                                    "mouseSerial",
                                    "mouseBrand",
                                    "mouseStatus",
                                  )
                                }
                                className="bg-purple-600 text-white px-3 rounded-r-md hover:bg-purple-700"
                              >
                                <CiSearch size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Marca
                            </label>
                            <select
                              className="w-full border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-purple-400"
                              value={formData.mouseBrand}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  mouseBrand: e.target.value,
                                })
                              }
                            >
                              <option value="" disabled>
                                -- Selecciona la marca --
                              </option>
                              <option value="Vit">Vit</option>
                              <option value="Lenovo">Lenovo</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>
                          <div className="md:col-span-2 flex justify-around items-center border border-gray-200 bg-white rounded-md py-1 px-2 h-[34px]">
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-green-600"
                                checked={formData.mouseStatus === "Bueno"}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    mouseStatus: "Bueno",
                                  })
                                }
                              />
                              <span className="text-[10px] font-bold">B</span>
                            </label>
                            <div className="w-[1px] h-4 bg-gray-200"></div>
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-red-600"
                                checked={formData.mouseStatus === "Malo"}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    mouseStatus: "Malo",
                                  })
                                }
                              />
                              <span className="text-[10px] font-bold">M</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cornetas */}
                    <div className="bg-purple-50/30 p-4 rounded-xl border border-purple-100 shadow-sm flex flex-col gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer w-fit">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-purple-600 rounded border-gray-300"
                          checked={formData.hasSpeakers}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hasSpeakers: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm font-bold text-purple-800 uppercase tracking-wide">
                          Incluir Cornetas
                        </span>
                      </label>

                      {formData.hasSpeakers && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in duration-300">
                          <div className="md:col-span-6">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Serial de las Cornetas
                            </label>
                            <div className="relative flex">
                              <input
                                type="text"
                                className="w-full border-gray-300 rounded-l-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-purple-400 font-mono"
                                placeholder="S/N Cornetas..."
                                value={formData.speakersSerial}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    speakersSerial: e.target.value,
                                  })
                                }
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleSearchSerial(
                                    "speakersSerial",
                                    "speakersBrand",
                                    "speakersStatus",
                                  )
                                }
                                className="bg-purple-600 text-white px-3 rounded-r-md hover:bg-purple-700"
                              >
                                <CiSearch size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Marca
                            </label>
                            <select
                              className="w-full border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-purple-400"
                              value={formData.speakersBrand}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  speakersBrand: e.target.value,
                                })
                              }
                            >
                              <option value="" disabled>
                                -- Selecciona la marca --
                              </option>
                              <option value="Genius">Genius</option>
                              <option value="Logitech">Logitech</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>
                          <div className="md:col-span-2 flex justify-around items-center border border-gray-200 bg-white rounded-md py-1 px-2 h-[34px]">
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-green-600"
                                checked={formData.speakersStatus === "Bueno"}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    speakersStatus: "Bueno",
                                  })
                                }
                              />
                              <span className="text-[10px] font-bold">B</span>
                            </label>
                            <div className="w-[1px] h-4 bg-gray-200"></div>
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-red-600"
                                checked={formData.speakersStatus === "Malo"}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    speakersStatus: "Malo",
                                  })
                                }
                              />
                              <span className="text-[10px] font-bold">M</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}



                {/* UBICACION DE LLEGADA DE PROCEDENCIA*/}
                <div className="pt-6 border-t border-gray-200 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                    <div className="col-span-full">
                      <h3 className="text-sm font-bold text-blue-800 uppercase">
                        Procedencia del Equipo
                      </h3>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Region <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="w-full border-gray-300 rounded-lg py-2 px-3 border outline-none bg-white focus:ring-2 focus:ring-primary-500"
                        value={formData.regionP}
                        onChange={(e) =>
                          setFormData({ ...formData, regionP: e.target.value })
                        }
                      >
                        <option value="" disabled>
                          Seleccione Región
                        </option>
                        <option value="Central">Central</option>
                        <option value="Centro Llano">Centro Llano</option>
                        <option value="CNT">CNT</option>
                        <option value="CORTIJOS">CORTIJOS</option>
                        <option value="ORIENTE">ORIENTE</option>
                        <option value="RCO">RCO</option>
                        <option value="RLA">RLA</option>
                        <option value="RNO">RNO</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Estado <span className="text-red-500">*</span>
                      </label>
                      <select
                        type="text"
                        required
                        placeholder="Ej: Lara"
                        className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500"
                        value={formData.estadoP}
                        onChange={(e) =>
                          setFormData({ ...formData, estadoP: e.target.value })
                        }
                      >
                        <option value="" disabled>
                          Seleccione Estado
                        </option>
                        <option value="Lara">Lara</option>
                        <option value="Yaracuy">Yaracuy</option>
                        <option value="Portuguesa">Portuguesa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Ciudad <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="w-full border-gray-300 rounded-lg py-2 px-3 border outline-none bg-white focus:ring-2 focus:ring-primary-500"
                        value={formData.cityP}
                        onChange={(e) =>
                          setFormData({ ...formData, cityP: e.target.value })
                        }
                      >
                        <option value="" disabled>
                          Seleccione Ciudad
                        </option>
                        <option value="Barquisimeto">Barquisimeto</option>
                        <option value="Caracas">Caracas</option>
                        <option value="San Felipe">San Felipe</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Sede / Torre <span className="text-red-500">*</span>
                      </label>
                      <select
                        type="text"
                        required
                        placeholder="Ej: Torre Central"
                        className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500"
                        value={formData.branchP}
                        onChange={(e) =>
                          setFormData({ ...formData, branchP: e.target.value })
                        }
                      >
                        <option value="" disabled>
                          Seleccione Torre
                        </option>
                        <option value="Barquisimeto">Torre 30</option>
                        <option value="Caracas">Torre Este</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Piso <span className="text-red-500">*</span>
                      </label>
                      <select
                        type="text"
                        required
                        placeholder="Ej: Piso 1"
                        className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500"
                        value={formData.pisoP}
                        onChange={(e) =>
                          setFormData({ ...formData, pisoP: e.target.value })
                        }
                      >
                        <option value="" disabled>
                          Seleccione Piso
                        </option>
                          <option value="Santa Rosa">Santa Rosa</option>
                          <option value="Planta Baja">Planta Baja</option>
                          <option value="MEZZ">MEZZ</option>
                          <option value="Piso 1">Piso 1</option>
                          <option value="Piso 2">Piso 2</option>
                          <option value="Piso 3">Piso 3</option>
                          <option value="Piso 4">Piso 4</option>
                          <option value="Piso 5">Piso 5</option>
                          <option value="Piso 6">Piso 6</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Ala <span className="text-red-500">*</span>
                      </label>
                      <select
                        type="text"
                        required
                        placeholder="Ej: Seleccione Ala 1"
                        className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500"
                        value={formData.alaP}
                        onChange={(e) =>
                          setFormData({ ...formData, alaP: e.target.value })
                        }
                      >
                        <option value="" disabled>
                          Seleccione Ala
                        </option>
                          <option value="Ala Norte">Ala Norte</option>
                          <option value="Ala Este">Ala Este</option>
                          <option value="Ala Sur">Ala Sur</option>
                          <option value="Ala Oeste">Ala Oeste</option>
                      </select>
                    </div>

                  </div>

                </div>


                {/* ASIGNACION DE ALMACÉN */}
                <div className="pt-6 border-t border-gray-200 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                    <div className="col-span-full">
                      <h3 className="text-sm font-bold text-blue-800 uppercase">
                        Asignación de Almacén
                      </h3>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Región <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="w-full border-gray-300 rounded-lg py-2 px-3 border outline-none bg-white focus:ring-2 focus:ring-primary-500"
                        value={formData.region}
                        onChange={(e) =>
                          setFormData({ ...formData, region: e.target.value })
                        }
                      >
                        <option value="" disabled>
                          Seleccione Region
                        </option>
                        <option value="Lara">Lara</option>
                        <option value="Yaracuy">Yaracuy</option>
                        <option value="Portuguesa">Portuguesa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Estado <span className="text-red-500">*</span>
                      </label>
                      <select
                        type="text"
                        required
                        placeholder="Ej: Lara"
                        className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500"
                        value={formData.estado}
                        onChange={(e) =>
                          setFormData({ ...formData, estado: e.target.value })
                        }
                      >
                        <option value="" disabled>
                          Seleccione Estado
                        </option>
                        <option value="Lara">Lara</option>
                        <option value="Yaracuy">Yaracuy</option>
                        <option value="Portuguesa">Portuguesa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Ciudad <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="w-full border-gray-300 rounded-lg py-2 px-3 border outline-none bg-white focus:ring-2 focus:ring-primary-500"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                      >
                        <option value="" disabled>
                          Seleccione Ciudad
                        </option>
                        <option value="Barquisimeto">Barquisimeto</option>
                        <option value="Caracas">Caracas</option>
                        <option value="San Felipe">San Felipe</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Sede / Torre <span className="text-red-500">*</span>
                      </label>
                      <select
                        type="text"
                        required
                        placeholder="Ej: Torre Central"
                        className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500"
                        value={formData.branch}
                        onChange={(e) =>
                          setFormData({ ...formData, branch: e.target.value })
                        }
                      >
                        <option value="" disabled>
                          Seleccione Torre
                        </option>
                        <option value="Barquisimeto">Torre 30</option>
                        <option value="Caracas">Torre Este</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Piso <span className="text-red-500">*</span>
                      </label>
                      <select
                        type="text"
                        required
                        placeholder="Ej: Piso 1"
                        className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500"
                        value={formData.piso}
                        onChange={(e) =>
                          setFormData({ ...formData, piso: e.target.value })
                        }
                      >
                        <option value="" disabled>
                          Seleccione Piso
                        </option>
                          <option value="Santa Rosa">Santa Rosa</option>
                          <option value="Planta Baja">Planta Baja</option>
                          <option value="MEZZ">MEZZ</option>
                          <option value="Piso 1">Piso 1</option>
                          <option value="Piso 2">Piso 2</option>
                          <option value="Piso 3">Piso 3</option>
                          <option value="Piso 4">Piso 4</option>
                          <option value="Piso 5">Piso 5</option>
                          <option value="Piso 3">Piso 6</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Ala <span className="text-red-500">*</span>
                      </label>
                      <select
                        type="text"
                        required
                        placeholder="Ej: Seleccione Ala 1"
                        className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500"
                        value={formData.ala}
                        onChange={(e) =>
                          setFormData({ ...formData, ala: e.target.value })
                        }
                      >
                        <option value="" disabled>
                          Seleccione Ala
                        </option>
                          <option value="Ala Norte">Ala Norte</option>
                          <option value="Ala Este">Ala Este</option>
                          <option value="Ala Sur">Ala Sur</option>
                          <option value="Ala Oeste">Ala Oeste</option>
                      </select>
                    </div>

                  </div>


                {/* FECHA DE INCORPORACIÓN */}
                <div className="pt-6 border-t border-gray-200 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                    <div className="col-span-full">
                      <h3 className="text-sm font-bold text-blue-800 uppercase">
                        Fecha de Incorporación
                      </h3>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Fecha <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        selected={formData.acquisitionDate}
                        onChange={(date) => setFormData({ ...formData, acquisitionDate: date })}
                        dateFormat="dd/MM/yyyy"
                        locale={es}
                        className="block w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-2 focus:ring-primary-500 text-base border outline-none bg-white"
                      />
                    </div>
                  
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-bold text-black mb-2"
                    >
                      Notas / Observaciones
                    </label>
                    <textarea
                      id="description"
                      rows="3"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="block w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm border outline-none focus:ring-primary-500"
                      placeholder="Detalles sobre desgaste físico, faltantes o fallas detectadas en general..."
                    ></textarea>
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex justify-end gap-4 border-t border-gray-100 pt-8 mt-8">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center px-6 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    <FiX className="mr-2 -ml-1 h-5 w-5" />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    <FiSave className="mr-2 -ml-1 h-5 w-5" />
                    Guardar Registro
                  </button>
                </div>
              </div>
              </div>
              </div>
            )}
          </form>
        </div>
      </main >
    </div >
  );
}
