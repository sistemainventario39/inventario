import React, { useState, useEffect } from "react";
import {
  FiSave,
  FiX,
  FiInfo,
  FiMapPin,
  FiCpu,
  FiMonitor,
  FiLink,
} from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import axios from "axios";

// COMPONENTES UI REUTILIZABLES
import StatusToggle from "../../components/ui/StatusToggle";
import SerialSearchInput from "../../components/ui/SerialSearchInput";
import LocationSelector from "../../components/ui/LocationSelector";

export default function EquipoForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  mode = "create",
  isSubmitting = false,
}) {
  // =========================
  // ESTADOS DE UI Y BÚSQUEDA
  // =========================
  const [activeTab, setActiveTab] = useState("general");
  const [equiposList, setEquiposList] = useState([]); // Para poblar el select de Acoplamiento
  const [loadingEquipos, setLoadingEquipos] = useState(false);

  const [searchMessages, setSearchMessages] = useState({
    serial: "",
    monitorSerial: "",
    keyboardSerial: "",
    mouseSerial: "",
    speakersSerial: "",
  });

  const [searchErrors, setSearchErrors] = useState({
    serial: false,
    monitorSerial: false,
    keyboardSerial: false,
    mouseSerial: false,
    speakersSerial: false,
  });

  // Determinar si es un equipo principal o un periférico
  const isEquipo = formData.type === "PC" || formData.type === "Laptop";
  const isPeriferico = formData.type && !isEquipo;

  // =========================
  // EFECTO: CARGAR LISTA DE EQUIPOS (Para Acoplamiento de Periféricos)
  // =========================
  useEffect(() => {
    // Solo cargamos la lista si estamos editando un periférico
    if (mode === "edit" && isPeriferico) {
      const fetchEquipos = async () => {
        setLoadingEquipos(true);
        try {
          // NOTA: Esta API debe ser creada en el backend (Punto 9)
          const res = await axios.get(
            "/api/equipos/lista",
          );
          setEquiposList(res.data);
        } catch (error) {
          console.error(
            "No se pudo cargar la lista de equipos disponibles",
            error,
          );
        } finally {
          setLoadingEquipos(false);
        }
      };
      fetchEquipos();
    }
  }, [mode, isPeriferico]);

  // =========================
  // CONTROLADORES DE BÚSQUEDA Y AUTOCOMPLETADO
  // =========================
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
        region: "Centro Occidente",
        estado: "Lara",
        city: "Barquisimeto",
        sede: "Torre 30",
        piso: "3",
        ala: "",
      },
      torreEste: {
        region: "Centro Occidente",
        estado: "Lara",
        city: "Barquisimeto",
        sede: "Torre Este",
        piso: "3",
        ala: "",
      },
    };

    const data = defaults[type];

    if (section === "P") {
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

  const handleSearchSerial = async (
    dispositivo,
    serialField,
    capacityField,
    statusField,
  ) => {
    const serialValue = formData[serialField]?.trim();
    setSearchMessages((prev) => ({ ...prev, [serialField]: "" }));
    setSearchErrors((prev) => ({ ...prev, [serialField]: false }));

    if (!serialValue) {
      setSearchMessages((prev) => ({
        ...prev,
        [serialField]: "Por favor, ingrese un número de serie.",
      }));
      setSearchErrors((prev) => ({ ...prev, [serialField]: true }));
      return;
    }

    try {
      const response = await axios.get(
        `/api/${dispositivo}/${encodeURIComponent(serialValue)}`,
      );

      if (response.data.length > 0) {
        setSearchMessages((prev) => ({
          ...prev,
          [serialField]: `El número de serie "${serialValue}" ya está registrado.`,
        }));
        setSearchErrors((prev) => ({ ...prev, [serialField]: true }));
        if (capacityField && statusField)
          setFormData((prev) => ({ ...prev, [statusField]: "Bueno" }));
      } else {
        setSearchMessages((prev) => ({
          ...prev,
          [serialField]: `El número de serie "${serialValue}" está disponible.`,
        }));
        setSearchErrors((prev) => ({ ...prev, [serialField]: false }));
      }
    } catch (error) {
      setSearchMessages((prev) => ({
        ...prev,
        [serialField]: error.response?.data?.message || "Error de conexión.",
      }));
      setSearchErrors((prev) => ({ ...prev, [serialField]: true }));
    }
  };

  const handleSearchSerial2 = async (dispositivo, serialField) => {
    const serialValue = formData[serialField]?.trim();
    setSearchMessages((prev) => ({ ...prev, [serialField]: "" }));
    setSearchErrors((prev) => ({ ...prev, [serialField]: false }));

    if (!serialValue) return;

    try {
      const response = await axios.get(
        `/api/verificar-periferico/${dispositivo}/${encodeURIComponent(serialValue)}`,
      );
      const resultado = response.data;
      setSearchMessages((prev) => ({
        ...prev,
        [serialField]: resultado.message,
      }));
      setSearchErrors((prev) => ({
        ...prev,
        [serialField]: resultado.existe && resultado.asignado,
      }));
    } catch (error) {
      setSearchMessages((prev) => ({
        ...prev,
        [serialField]: "Error de conexión.",
      }));
      setSearchErrors((prev) => ({ ...prev, [serialField]: true }));
    }
  };

  // =========================
  // SISTEMA DE PESTAÑAS (TABS)
  // =========================
  const tabs = [
    { id: "general", label: "General", icon: <FiInfo /> },
    ...(isEquipo
      ? [{ id: "componentes", label: "Componentes", icon: <FiCpu /> }]
      : []),
    ...(isEquipo
      ? [{ id: "perifericos", label: "Periféricos", icon: <FiMonitor /> }]
      : []),
    { id: "ubicacion", label: "Ubicación", icon: <FiMapPin /> },
    // Pestaña de Acoplamiento SOLO para periféricos en edición
    ...(isPeriferico && mode === "edit"
      ? [{ id: "acoplamiento", label: "Acoplamiento", icon: <FiLink /> }]
      : []),
  ];

  return (
    <form onSubmit={onSubmit} className="bg-white flex flex-col h-full">
      {/* SECCIÓN 1: Selector de Tipo (SOLO EN MODO CREAR) */}
      {mode === "create" && (
        <div className="flex flex-col items-center p-8 border-b border-gray-100 bg-gray-50/50">
          <label
            htmlFor="type"
            className="block text-sm font-semibold text-primary-900 mb-3 uppercase tracking-wider"
          >
            ¿Qué tipo de activo deseas registrar?
          </label>
          <select
            id="type"
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="block w-full max-w-md border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg border transition-all outline-none bg-white text-center cursor-pointer"
          >
            <option value="">-- Selecciona una opción --</option>
            <option value="PC">PC</option>
            <option value="Laptop">Laptop</option>
            <option value="Monitor">Monitor</option>
            <option value="Teclado">Teclado</option>
            <option value="Mouse">Mouse</option>
            <option value="Switch">Switch</option>
            <option value="Impresora">Impresora</option>
            <option value="Corneta">Corneta</option>
          </select>
        </div>
      )}

      {/* RENDERIZADO PRINCIPAL CON PESTAÑAS */}
      {formData.type && (
        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Navegación de Pestañas */}
          <div className="flex px-8 border-b border-gray-200 bg-white sticky top-0 z-10 overflow-x-auto custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-5 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary-600 text-primary-700 bg-primary-50/30"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Contenedor del Formulario (Scrollable) */}
          <div className="p-8 space-y-8 flex-1 overflow-y-auto">
            {/* =======================
                TAB 1: GENERAL
            ======================= */}
            <div
              className={activeTab === "general" ? "block space-y-6" : "hidden"}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                {/* Identificador Visual de Modo Edición */}
                {mode === "edit" && (
                  <div className="col-span-full mb-4">
                    <span className="bg-primary-100 text-primary-800 text-xs font-extrabold uppercase px-3 py-1 rounded-full border border-primary-200">
                      Editando: {formData.type}
                    </span>
                  </div>
                )}

                <div className="col-span-full">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:flex-1">
                      <label className="block text-sm font-bold text-black mb-2">
                        Número de Serie (S/N){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <SerialSearchInput
                        value={formData.serial}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (searchMessages.serial)
                            setSearchMessages((prev) => ({
                              ...prev,
                              serial: "",
                            }));
                          setFormData((prev) => ({ ...prev, serial: value }));
                        }}
                        onSearch={() =>
                          handleSearchSerial(
                            formData.type.toLowerCase(),
                            "serial",
                            "capacidad",
                            "estado",
                          )
                        }
                        className={searchErrors.serial ? "border-red-500" : ""}
                      />
                      {searchMessages.serial && (
                        <p
                          className={`text-xs mt-1 ${searchErrors.serial ? "text-red-500 font-medium" : "text-emerald-600 font-medium"}`}
                        >
                          {searchMessages.serial}
                        </p>
                      )}
                    </div>
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

                <div className="col-span-full md:col-span-1">
                  <label className="block text-sm font-bold text-black mb-2">
                    Marca <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="block w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-2 focus:ring-primary-500 text-sm border outline-none bg-white cursor-pointer"
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

                <div className="col-span-full md:col-span-1">
                  <label className="block text-sm font-bold text-black mb-2">
                    Modelo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="block w-full border-gray-300 bg-white rounded-lg shadow-sm py-2 px-3 border outline-none font-mono focus:ring-primary-500 text-sm"
                    placeholder="Thinkpad X1..."
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Fecha y Notas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Fecha de Incorporación{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={formData.acquisitionDate}
                    onChange={(date) =>
                      setFormData({ ...formData, acquisitionDate: date })
                    }
                    dateFormat="dd/MM/yyyy"
                    locale={es}
                    className="block w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-2 focus:ring-primary-500 text-sm border outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Notas / Observaciones
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="block w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm border outline-none focus:ring-primary-500"
                    placeholder="Detalles adicionales, fallas..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* =======================
                TAB 2: COMPONENTES (Solo Equipos)
            ======================= */}
            {isEquipo && (
              <div
                className={
                  activeTab === "componentes" ? "block space-y-6" : "hidden"
                }
              >
                {/* Memoria RAM */}
                <div className="space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Memorias RAM
                  </label>
                  {formData.ramList.map((ram, index) => (
                    <div
                      key={`ram-${index}`}
                      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
                    >
                      <div className="md:col-span-8">
                        <select
                          className="w-full h-10 border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                          value={ram.capacity}
                          onChange={(e) => {
                            const newRamList = [...formData.ramList];
                            newRamList[index].capacity = e.target.value;
                            setFormData({ ...formData, ramList: newRamList });
                          }}
                        >
                          <option value="">-- Seleccione Capacidad --</option>
                          <option value="1GB DDR2">1GB DDR2</option>
                          <option value="2GB DDR2">2GB DDR2</option>
                          <option value="4GB DDR2">4GB DDR2</option>
                          <option value="1GB DDR3">1GB DDR3</option>
                          <option value="2GB DDR3">2GB DDR3</option>
                          <option value="4GB DDR3">4GB DDR3</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <StatusToggle
                          status={ram.status}
                          onStatusChange={(newStatus) => {
                            const newRamList = [...formData.ramList];
                            newRamList[index].status = newStatus;
                            setFormData({ ...formData, ramList: newRamList });
                          }}
                        />
                      </div>
                      <div className="md:col-span-1 flex gap-2 justify-end">
                        {formData.ramList.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                ramList: formData.ramList.filter(
                                  (_, i) => i !== index,
                                ),
                              })
                            }
                            className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                          >
                            <FiX size={16} />
                          </button>
                        )}
                        {index === formData.ramList.length - 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                ramList: [
                                  ...formData.ramList,
                                  { capacity: "", status: "Bueno" },
                                ],
                              })
                            }
                            className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors font-bold text-lg"
                          >
                            +
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Discos Duros */}
                <div className="space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Almacenamiento (Discos)
                  </label>
                  {formData.storageList.map((storage, index) => (
                    <div
                      key={`storage-${index}`}
                      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
                    >
                      <div className="md:col-span-8">
                        <select
                          className="w-full h-10 border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                          value={storage.capacity}
                          onChange={(e) => {
                            const newStorageList = [...formData.storageList];
                            newStorageList[index].capacity = e.target.value;
                            setFormData({
                              ...formData,
                              storageList: newStorageList,
                            });
                          }}
                        >
                          <option value="">-- Seleccione Capacidad --</option>
                          <option value="120GB HDD">120GB HDD</option>
                          <option value="250GB HDD">250GB HDD</option>
                          <option value="500GB HDD">500GB HDD</option>
                          <option value="1TB HDD">1TB HDD</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <StatusToggle
                          status={storage.status}
                          onStatusChange={(newStatus) => {
                            const newStorageList = [...formData.storageList];
                            newStorageList[index].status = newStatus;
                            setFormData({
                              ...formData,
                              storageList: newStorageList,
                            });
                          }}
                        />
                      </div>
                      <div className="md:col-span-1 flex gap-2 justify-end">
                        {formData.storageList.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                storageList: formData.storageList.filter(
                                  (_, i) => i !== index,
                                ),
                              })
                            }
                            className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                          >
                            <FiX size={16} />
                          </button>
                        )}
                        {index === formData.storageList.length - 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                storageList: [
                                  ...formData.storageList,
                                  { capacity: "", status: "Bueno" },
                                ],
                              })
                            }
                            className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors font-bold text-lg"
                          >
                            +
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Procesador */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-9">
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      Procesador
                    </label>
                    <select
                      value={formData.processor}
                      onChange={(e) =>
                        setFormData({ ...formData, processor: e.target.value })
                      }
                      className="w-full h-10 border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-blue-400 bg-white cursor-pointer"
                    >
                      <option value="">-- Seleccionar Procesador --</option>
                      <option value="Intel Core 2 Duo">Intel Core 2 Duo</option>
                      <option value="Intel Pentium Dual-Core">
                        Intel Pentium Dual-Core
                      </option>
                      <option value="Intel Core i3">Intel Core i3</option>
                      <option value="Intel Core i5">Intel Core i5</option>
                      <option value="Intel Core i7">Intel Core i7</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <StatusToggle
                      status={formData.processorStatus}
                      onStatusChange={(newStatus) =>
                        setFormData({ ...formData, processorStatus: newStatus })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* =======================
                TAB 3: PERIFERICOS ASOCIADOS (Solo Equipos)
            ======================= */}
            {isEquipo && (
              <div
                className={
                  activeTab === "perifericos" ? "block space-y-4" : "hidden"
                }
              >
                {[
                  {
                    key: "Monitor",
                    has: "hasMonitor",
                    serial: "monitorSerial",
                    brand: "monitorBrand",
                    status: "monitorStatus",
                    search: "monitor",
                    options: ["Vit", "Lenovo", "Otro"],
                  },
                  {
                    key: "Teclado",
                    has: "hasKeyboard",
                    serial: "keyboardSerial",
                    brand: "keyboardBrand",
                    status: "keyboardStatus",
                    search: "teclados",
                    options: ["Vit", "Lenovo", "Otro"],
                  },
                  {
                    key: "Mouse",
                    has: "hasMouse",
                    serial: "mouseSerial",
                    brand: "mouseBrand",
                    status: "mouseStatus",
                    search: "mouse",
                    options: ["Vit", "Lenovo", "Otro"],
                  },
                  {
                    key: "Cornetas",
                    has: "hasSpeakers",
                    serial: "speakersSerial",
                    brand: "speakersBrand",
                    status: "speakersStatus",
                    search: "cornetas",
                    options: ["Genius", "Logitech", "Otro"],
                  },
                ].map((perif) => (
                  <div
                    key={perif.key}
                    className="bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4"
                  >
                    <label className="flex items-center space-x-3 cursor-pointer w-fit">
                      <input
                        type="checkbox"
                        className="h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        checked={formData[perif.has]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [perif.has]: e.target.checked,
                          })
                        }
                      />
                      <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                        Incluir {perif.key}
                      </span>
                    </label>

                    {formData[perif.has] && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white p-4 rounded-xl border border-gray-200 animate-in fade-in duration-300">
                        <div className="md:col-span-6">
                          <label className="block text-xs font-bold text-black mb-1 uppercase">
                            Serial del {perif.key}
                          </label>
                          <SerialSearchInput
                            placeholder={`S/N ${perif.key}...`}
                            inputClassName="py-1.5 focus:ring-1 focus:ring-primary-400 rounded-l-md"
                            buttonColor="bg-primary-600 hover:bg-primary-700 rounded-r-md"
                            buttonIconSize={16}
                            value={formData[perif.serial]}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [perif.serial]: e.target.value,
                              })
                            }
                            onSearch={() =>
                              handleSearchSerial2(perif.search, perif.serial)
                            }
                          />
                          {searchMessages[perif.serial] && (
                            <p
                              className={`text-xs mt-1 ${searchErrors[perif.serial] ? "text-red-500 font-medium" : "text-emerald-600 font-medium"}`}
                            >
                              {searchMessages[perif.serial]}
                            </p>
                          )}
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-xs font-bold text-black mb-1 uppercase">
                            Marca
                          </label>
                          <select
                            className="w-full h-10 border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-primary-400"
                            value={formData[perif.brand]}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [perif.brand]: e.target.value,
                              })
                            }
                          >
                            <option value="" disabled>
                              -- Marca --
                            </option>
                            {perif.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <StatusToggle
                            // Accedemos a la propiedad usando la llave dinámica que definiste en el objeto del map
                            status={formData[perif.status]}
                            onStatusChange={(newStatus) => {
                              // Actualizamos el estado usando la misma llave dinámica
                              setFormData({
                                ...formData,
                                [perif.status]: newStatus, // Esto equivale a poner "monitorStatus": newStatus
                              });
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* =======================
                TAB 4: UBICACIÓN
            ======================= */}
            <div
              className={
                activeTab === "ubicacion" ? "block space-y-6" : "hidden"
              }
            >
              {/* Ocultamos PROCEDENCIA en modo Edición (Punto 5) */}
              {mode === "create" && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-gray-800 uppercase flex items-center gap-2">
                    <FiMapPin /> Procedencia Geográfica (Llegada)
                  </h3>
                  <LocationSelector
                    radioGroupName="procedencia_default"
                    formData={formData}
                    setFormData={setFormData}
                    handleDefaultLocation={handleDefaultLocation}
                    typePrefix="P"
                  />
                </div>
              )}

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-800 uppercase flex items-center gap-2">
                  <FiMapPin /> Asignación de Almacén / Física
                </h3>
                <LocationSelector
                  radioGroupName="asignacion_default"
                  formData={formData}
                  setFormData={setFormData}
                  handleDefaultLocation={handleDefaultLocation}
                  typePrefix=""
                />
              </div>
            </div>

            {/* =======================
                TAB 5: ACOPLAMIENTO (Solo Periféricos en Edición)
            ======================= */}
            {isPeriferico && mode === "edit" && (
              <div
                className={
                  activeTab === "acoplamiento" ? "block space-y-6" : "hidden"
                }
              >
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2 mb-2">
                      <FiLink /> Relación con Estación de Trabajo
                    </h3>
                    <p className="text-sm text-blue-700">
                      Asigna este periférico a un equipo principal o déjalo
                      libre en el almacén.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
                    <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                      Seleccionar Equipo (PC / Laptop)
                    </label>

                    {loadingEquipos ? (
                      <div className="flex items-center gap-3 text-sm text-gray-500 p-2">
                        <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                        Cargando equipos disponibles...
                      </div>
                    ) : (
                      <select
                        value={
                          formData.asignadoA ||
                          formData.equipoRelacionado?.id ||
                          ""
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            asignadoA: e.target.value,
                          })
                        }
                        className="block w-full border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-primary-500 text-base border outline-none bg-white cursor-pointer"
                      >
                        <option value="" disabled>
                          -- Sin asignar (Disponible en Stock) --
                        </option>
                        {equiposList.map((eq) => (
                          <option key={eq.id} value={eq.id}>
                            {eq.tipo} - {eq.marca} {eq.modelo} (S/N: {eq.serial}
                            )
                          </option>
                        ))}
                      </select>
                    )}

                    {formData.asignadoA && (
                      <p className="mt-3 text-xs text-blue-600 font-medium">
                        * Al guardar los cambios, este periférico se asociará
                        automáticamente al equipo seleccionado y se actualizarán
                        las referencias en la base de datos.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =======================
              FOOTER: BOTONES DE ACCIÓN
          ======================= */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-4 shrink-0 rounded-b-3xl">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex items-center px-6 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none transition-all disabled:opacity-50"
            >
              <FiX className="mr-2 -ml-1 h-5 w-5" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2.5 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition-all disabled:opacity-50 hover:shadow-lg"
            >
              <FiSave className="mr-2 -ml-1 h-5 w-5" />
              {mode === "edit" ? "Guardar Cambios" : "Guardar Registro"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
