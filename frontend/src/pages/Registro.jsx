import React, { useState } from "react";
import Header from "../components/layout/Header";
import { FiSave, FiX } from "react-icons/fi";
// Importamos los iconos de búsqueda ya no es necesario aquí, se movió a SerialSearchInput
// import { CiSearch } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";

// NUEVAS IMPORTACIONES
import StatusToggle from "../components/ui/StatusToggle";
import SerialSearchInput from "../components/ui/SerialSearchInput";
import LocationSelector from "../components/ui/LocationSelector";

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
    sedeP: "",
    pisoP: "",
    alaP: "",

    // Ubicación
    region: "",
    estado: "",
    city: "",
    sede: "",
    piso: "",
    ala: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/busqueda");
  };

  // Función para autocompletar lol
  const handleDefaultLocation = (section, type) => {
    const defaults = {
      limpiar: {
        region: "",
        estado: "",
        city: "",
        sede: "",
        piso: "",
        ala: "",
      },
      torre30: {
        region: 1,
        estado: 12,
        city: 212,
        sede: 3,
        piso: 2,
        ala: "",
      },
      torreEste: {
        region: 1,
        estado: 12,
        city: 212,
        sede: 4,
        piso: 4,
        ala: 6,
      },
    };

    const data = defaults[type];

    if (section === "P") {
      // Procedencia
      setFormData((prev) => ({
        ...prev,
        regionP: data.region,
        estadoP: data.estado,
        cityP: data.city,
        sedeP: data.sede,
        pisoP: data.piso,
        alaP: data.ala,
      }));
    } else {
      // Asignación (A)
      setFormData((prev) => ({
        ...prev,
        region: data.region,
        estado: data.estado,
        city: data.city,
        sede: data.sede,
        piso: data.piso,
        ala: data.ala,
      }));
    }
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
                <option value="Corneta">Corneta</option>
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

                  {/* Contenedor Serial + Estado (REFACTORIZADO) */}
                  <div className="col-span-full">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                      {/* Sección Número de Serie - REFACTORIZADO CON SerialSearchInput */}
                      <div className="w-full md:flex-1">
                        <label className="block text-sm font-bold text-black mb-2">
                          Número de Serie (S/N){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <SerialSearchInput
                          value={formData.serial}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              serial: e.target.value,
                            })
                          }
                          onSearch={() => handleSearchSerial("serial")}
                        />
                      </div>

                      {/* Sección Estado - REFACTORIZADO CON StatusToggle */}
                      <div className="w-full md:w-auto">
                        <label className="block text-sm font-bold text-black mb-2">
                          Estado <span className="text-red-500">*</span>
                        </label>
                        <StatusToggle
                          status={formData.status}
                          onStatusChange={(newStatus) =>
                            setFormData({ ...formData, status: newStatus })
                          }
                        />
                      </div>
                    </div>
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
                      {formData.type !== "Switch" &&
                        formData.type !== "Impresora" && (
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
                      {formData.type === "Impresora" && (
                        <>
                          <option value="HP">HP</option>
                          <option value="Lexmark">Lexmark</option>
                          <option value="Dellcop">Dellcop</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Modelo */}
                  <div className="col-span-full md:col-span-1">
                    <label className="block text-sm font-bold text-black mb-2">
                      Modelo <span className="text-red-500">*</span>
                    </label>
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

                {/* COMPONENTES INTERNOS (Solo CPU / Laptop) */}
                {(formData.type === "CPU" || formData.type === "Laptop") && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">
                      Componentes Internos
                    </h3>

                    {/* Memoria RAM (REFACTORIZADO) */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-6">
                        <label className="block text-xs font-bold text-black mb-1 uppercase">
                          Serial Memoria RAM
                        </label>
                        {/* REFACTORIZADO CON SerialSearchInput (Estilo custom) */}
                        <SerialSearchInput
                          placeholder="S/N RAM..."
                          inputClassName="py-1.5 focus:ring-1 focus:ring-blue-400 rounded-l-md"
                          buttonColor="bg-primary-600 hover:bg-primary-700 rounded-r-md"
                          buttonIconSize={16}
                          value={formData.ramSerial}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ramSerial: e.target.value,
                            })
                          }
                          onSearch={() =>
                            handleSearchSerial("ramSerial", "ram", "ramStatus")
                          }
                        />
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-black mb-1 uppercase">
                          Capacidad
                        </label>
                        <select
                          className="w-full h-10 border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-blue-400 bg-white"
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
                      <div className="md:col-span-2">
                        {/* REFACTORIZADO CON StatusToggle (Estilo custom) */}
                        <StatusToggle
                          status={formData.ramStatus}
                          onStatusChange={(newStatus) =>
                            setFormData({ ...formData, ramStatus: newStatus })
                          }
                        />
                      </div>
                    </div>

                    {/* Disco Duro (REFACTORIZADO) */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-6">
                        <label className="block text-xs font-bold text-black mb-1 uppercase">
                          Serial Disco Duro
                        </label>
                        {/* REFACTORIZADO CON SerialSearchInput */}
                        <SerialSearchInput
                          placeholder="S/N Disco..."
                          inputClassName="py-1.5 focus:ring-1 focus:ring-blue-400 rounded-l-md"
                          buttonColor="bg-primary-600 hover:bg-primary-700 rounded-r-md"
                          buttonIconSize={16}
                          value={formData.storageSerial}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              storageSerial: e.target.value,
                            })
                          }
                          onSearch={() =>
                            handleSearchSerial(
                              "storageSerial",
                              "storage",
                              "storageStatus",
                            )
                          }
                        />
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-black mb-1 uppercase">
                          Capacidad
                        </label>
                        <select
                          className="w-full h-10 border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-blue-400 bg-white"
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
                      <div className="md:col-span-2">
                        {/* REFACTORIZADO CON StatusToggle */}
                        <StatusToggle
                          status={formData.storageStatus}
                          onStatusChange={(newStatus) =>
                            setFormData({
                              ...formData,
                              storageStatus: newStatus,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Procesador (REFACTORIZADO) */}
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
                          className="w-full h-10 border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-blue-400 bg-white cursor-pointer"
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
                      <div className="md:col-span-2">
                        {/* REFACTORIZADO CON StatusToggle */}
                        <StatusToggle
                          status={formData.processorStatus}
                          onStatusChange={(newStatus) =>
                            setFormData({
                              ...formData,
                              processorStatus: newStatus,
                            })
                          }
                        />
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

                    {/* Monitor (REFACTORIZADO) */}
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
                            {/* REFACTORIZADO CON SerialSearchInput (Estilo Morado) */}
                            <SerialSearchInput
                              placeholder="S/N Monitor..."
                              inputClassName="py-1.5 focus:ring-1 focus:ring-purple-400 rounded-l-md"
                              buttonColor="bg-purple-600 hover:bg-purple-700 rounded-r-md"
                              buttonIconSize={16}
                              value={formData.monitorSerial}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  monitorSerial: e.target.value,
                                })
                              }
                              onSearch={() =>
                                handleSearchSerial(
                                  "monitorSerial",
                                  "monitorBrand",
                                  "monitorStatus",
                                )
                              }
                            />
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Marca
                            </label>
                            <select
                              className="w-full h-10 border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-purple-400"
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
                          <div className="md:col-span-2">
                            {/* REFACTORIZADO CON StatusToggle */}
                            <StatusToggle
                              status={formData.monitorStatus}
                              onStatusChange={(newStatus) =>
                                setFormData({
                                  ...formData,
                                  monitorStatus: newStatus,
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Teclado (REFACTORIZADO) */}
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
                            {/* REFACTORIZADO CON SerialSearchInput */}
                            <SerialSearchInput
                              placeholder="S/N Teclado..."
                              inputClassName="py-1.5 focus:ring-1 focus:ring-purple-400 rounded-l-md"
                              buttonColor="bg-purple-600 hover:bg-purple-700 rounded-r-md"
                              buttonIconSize={16}
                              value={formData.keyboardSerial}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  keyboardSerial: e.target.value,
                                })
                              }
                              onSearch={() =>
                                handleSearchSerial(
                                  "keyboardSerial",
                                  "keyboardBrand",
                                  "keyboardStatus",
                                )
                              }
                            />
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Marca
                            </label>
                            <select
                              className="w-full h-10 border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-purple-400"
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
                          <div className="md:col-span-2">
                            {/* REFACTORIZADO CON StatusToggle */}
                            <StatusToggle
                              status={formData.keyboardStatus}
                              onStatusChange={(newStatus) =>
                                setFormData({
                                  ...formData,
                                  keyboardStatus: newStatus,
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mouse (REFACTORIZADO) */}
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
                            {/* REFACTORIZADO CON SerialSearchInput */}
                            <SerialSearchInput
                              placeholder="S/N Mouse..."
                              inputClassName="py-1.5 focus:ring-1 focus:ring-purple-400 rounded-l-md"
                              buttonColor="bg-purple-600 hover:bg-purple-700 rounded-r-md"
                              buttonIconSize={16}
                              value={formData.mouseSerial}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  mouseSerial: e.target.value,
                                })
                              }
                              onSearch={() =>
                                handleSearchSerial(
                                  "mouseSerial",
                                  "mouseBrand",
                                  "mouseStatus",
                                )
                              }
                            />
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Marca
                            </label>
                            <select
                              className="w-full h-10 border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-purple-400"
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
                          <div className="md:col-span-2">
                            {/* REFACTORIZADO CON StatusToggle */}
                            <StatusToggle
                              status={formData.mouseStatus}
                              onStatusChange={(newStatus) =>
                                setFormData({
                                  ...formData,
                                  mouseStatus: newStatus,
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cornetas (REFACTORIZADO) */}
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
                            {/* REFACTORIZADO CON SerialSearchInput */}
                            <SerialSearchInput
                              placeholder="S/N Cornetas..."
                              inputClassName="py-1.5 focus:ring-1 focus:ring-purple-400 rounded-l-md"
                              buttonColor="bg-purple-600 hover:bg-purple-700 rounded-r-md"
                              buttonIconSize={16}
                              value={formData.speakersSerial}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  speakersSerial: e.target.value,
                                })
                              }
                              onSearch={() =>
                                handleSearchSerial(
                                  "speakersSerial",
                                  "speakersBrand",
                                  "speakersStatus",
                                )
                              }
                            />
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Marca
                            </label>
                            <select
                              className="w-full h-10 border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-purple-400"
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
                          <div className="md:col-span-2">
                            {/* REFACTORIZADO CON StatusToggle */}
                            <StatusToggle
                              status={formData.speakersStatus}
                              onStatusChange={(newStatus) =>
                                setFormData({
                                  ...formData,
                                  speakersStatus: newStatus,
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* UBICACION DE LLEGADA DE PROCEDENCIA (REFACTORIZADO COMPLETO) */}
                <div className="pt-6 border-t border-gray-200 space-y-6">
                  {/* REFACTORIZADO CON LocationSelector */}
                  <LocationSelector
                    title="Procedencia del Equipo"
                    radioGroupName="procedencia_default"
                    formData={formData}
                    setFormData={setFormData}
                    handleDefaultLocation={handleDefaultLocation}
                    typePrefix="P" // Importante: agrega la 'P' a regionP, estadoP, etc.
                  />
                </div>

                {/* ASIGNACION DE ALMACÉN (REFACTORIZADO COMPLETO) */}
                <div className="pt-6 border-t border-gray-200 space-y-6">
                  {/* REFACTORIZADO CON LocationSelector */}
                  <LocationSelector
                    title="Asignación de Almacén"
                    radioGroupName="asignacion_default"
                    formData={formData}
                    setFormData={setFormData}
                    handleDefaultLocation={handleDefaultLocation}
                    typePrefix="" // Vacío: usa region, estado, etc.
                  />

                  {/* FECHA DE INCORPORACIÓN (Se mantiene igual, no se repite) */}
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
                          onChange={(date) =>
                            setFormData({ ...formData, acquisitionDate: date })
                          }
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
      </main>
    </div>
  );
}
