import React, { useState } from "react";
import Header from "../components/layout/Header";
import { FiSave, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import axios from "axios";
import { equipoSchema } from "../validators/equipoSchema";
// NUEVAS IMPORTACIONES
import StatusToggle from "../components/ui/StatusToggle";
import SerialSearchInput from "../components/ui/SerialSearchInput";
import LocationSelector from "../components/ui/LocationSelector";

export default function Registro() {
  const navigate = useNavigate();
  // Estados para controlar el mensaje debajo del Serial
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
    ramList: [{ capacity: "", status: "Bueno" }],
    storageList: [{ capacity: "", status: "Bueno" }],
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Validación de Zod
      equipoSchema.parse(formData);

      const tipoDispositivo = formData.type.toUpperCase();

      // 2. Estructura Base para TODOS los equipos (PC, Laptop o Periféricos)
      const payload = {
        marca: formData.name.trim(),
        modelo: formData.model.trim(),
        serial: formData.serial,
        estado: formData.status,
        notas: formData.description || "",
        procedencia: {
          id_region: formData.regionP,
          id_estado: formData.estadoP,
          id_ciudad: formData.cityP,
          id_sede: formData.sedeP,
          id_piso: formData.pisoP,
          id_ala: formData.alaP || null,
        },
        asignacion: {
          id_region: formData.region,
          id_estado: formData.estado,
          id_ciudad: formData.city,
          id_sede: formData.sede,
          id_piso: formData.piso,
          id_ala: formData.ala || null,
        },
      };

      let url = "";

      // 3. Si es CPU o LAPTOP, agregamos Componentes y Periféricos vinculados
      if (tipoDispositivo === "CPU" || tipoDispositivo === "LAPTOP") {
        payload.componentes = [];
        payload.perifericos = [];

        // Mapear múltiples RAMs (Generamos serial único si está vacío para evitar choques)
        formData.ramList?.forEach((ram, index) => {
          if (ram.capacity) {
            payload.componentes.push({
              tipo: "memoria_ram",
              capacidad: ram.capacity,
              estado: ram.status || formData.status,
              serial: ram.serial || `RAM-${Date.now()}-${index}`,
            });
          }
        });

        // Mapear múltiples Discos Duros
        formData.storageList?.forEach((disco, index) => {
          if (disco.capacity) {
            payload.componentes.push({
              tipo: "disco_duro",
              capacidad: disco.capacity,
              estado: disco.status || formData.status,
              serial: disco.serial || `HDD-${Date.now()}-${index}`,
            });
          }
        });

        // Procesador
        if (formData.processor) {
          payload.componentes.push({
            tipo: "procesador",
            modelo: formData.processor,
            estado: formData.processorStatus || formData.status,
            serial: `CPU-${Date.now()}`,
          });
        }

        // Periféricos asociados
        if (formData.hasMonitor && formData.monitorSerial) {
          payload.perifericos.push({
            tipo: "monitor",
            serial: formData.monitorSerial,
            modelo: formData.monitorBrand,
            estado: formData.monitorStatus,
          });
        }
        if (formData.hasKeyboard && formData.keyboardSerial) {
          payload.perifericos.push({
            tipo: "teclados",
            serial: formData.keyboardSerial,
            modelo: formData.keyboardBrand,
            estado: formData.keyboardStatus,
          });
        }
        if (formData.hasMouse && formData.mouseSerial) {
          payload.perifericos.push({
            tipo: "mouse",
            serial: formData.mouseSerial,
            modelo: formData.mouseBrand,
            estado: formData.mouseStatus,
          });
        }
        if (formData.hasSpeakers && formData.speakersSerial) {
          payload.perifericos.push({
            tipo: "mouse",
            serial: formData.speakersSerial,
            modelo: formData.speakersBrand,
            estado: formData.speakersStatus,
          });
        }

        url =
          tipoDispositivo === "LAPTOP"
            ? "http://localhost:3001/api/laptop"
            : "http://localhost:3001/api/pc";
      } else {
        const tipoClean = formData.type.toLowerCase();
        url = `http://localhost:3001/api/perifericos/${tipoClean}`;
      }

      // 5. Enviar Petición
      const response = await axios.post(url, payload);
      alert(response.data.message || "Equipo registrado exitosamente");
      navigate("/busqueda"); // Opcional: redirigir o limpiar formulario
    } catch (error) {
      if (error.errors) {
        alert(`Revisa el formulario: ${error.errors[0].message}`);
      } else {
        console.error("Error del servidor:", error);
        alert(
          error.response?.data?.message || "Ocurrió un error al registrar.",
        );
      }
    }
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
  const handleSearchSerial = async (
    dispositivo,
    serialField,
    capacityField,
    statusField,
  ) => {
    const serialValue = formData[serialField]?.trim();

    setSearchMessages((prev) => ({
      ...prev,
      [serialField]: "",
    }));

    setSearchErrors((prev) => ({
      ...prev,
      [serialField]: false,
    }));

    if (!serialValue) {
      setSearchMessages((prev) => ({
        ...prev,
        [serialField]: "Por favor, ingrese un número de serie antes de buscar.",
      }));

      setSearchErrors((prev) => ({
        ...prev,
        [serialField]: true,
      }));

      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3001/api/${dispositivo}/${encodeURIComponent(serialValue)}`,
      );

      const resultado = response.data;

      if (resultado.length > 0) {
        setSearchMessages((prev) => ({
          ...prev,
          [serialField]: `El número de serie "${serialValue}" ya se encuentra registrado en el sistema.`,
        }));

        setSearchErrors((prev) => ({
          ...prev,
          [serialField]: true,
        }));

        if (capacityField && statusField) {
          setFormData((prev) => ({
            ...prev,
            [statusField]: "Bueno",
          }));
        }
      } else {
        setSearchMessages((prev) => ({
          ...prev,
          [serialField]: `El número de serie "${serialValue}" está disponible para registro.`,
        }));

        setSearchErrors((prev) => ({
          ...prev,
          [serialField]: false,
        }));
      }
    } catch (error) {
      console.error(`Error al buscar el serial en ${dispositivo}:`, error);

      setSearchMessages((prev) => ({
        ...prev,
        [serialField]:
          error.response?.data?.message ||
          "No se pudo conectar con el servidor.",
      }));

      setSearchErrors((prev) => ({
        ...prev,
        [serialField]: true,
      }));
    }
  };

  const handleSearchSerial2 = async (dispositivo, serialField) => {
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
      // Apuntamos a la NUEVA API
      const response = await axios.get(
        `http://localhost:3001/api/verificar-periferico/${dispositivo}/${encodeURIComponent(serialValue)}`,
      );

      const resultado = response.data;

      if (resultado.existe && resultado.asignado) {
        // Existe y está ASIGNADO a un equipo
        setSearchMessages((prev) => ({
          ...prev,
          [serialField]: resultado.message,
        }));
        setSearchErrors((prev) => ({ ...prev, [serialField]: true }));
      } else if (resultado.existe && !resultado.asignado) {
        // Existe pero NO está asignado
        setSearchMessages((prev) => ({
          ...prev,
          [serialField]: resultado.message,
        }));
        setSearchErrors((prev) => ({ ...prev, [serialField]: false }));
      } else {
        // No existe, está libre para registrarse
        setSearchMessages((prev) => ({
          ...prev,
          [serialField]: resultado.message,
        }));
        setSearchErrors((prev) => ({ ...prev, [serialField]: false }));
      }
    } catch (error) {
      console.error(`Error al buscar el serial en ${dispositivo}:`, error);
      setSearchMessages((prev) => ({
        ...prev,
        [serialField]:
          error.response?.data?.message ||
          "No se pudo conectar con el servidor.",
      }));
      setSearchErrors((prev) => ({ ...prev, [serialField]: true }));
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
                      {formData.type && formData.type !== "" && (
                        <div className="w-full md:flex-1">
                          <label className="block text-sm font-bold text-black mb-2">
                            Número de Serie de {formData.type} (S/N){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <SerialSearchInput
                            value={formData.serial}
                            onChange={(e) => {
                              const value = e.target.value;

                              // limpiar mensaje si estaba visible
                              if (searchMessages.serial) {
                                setSearchMessages((prev) => ({
                                  ...prev,
                                  serial: "",
                                }));
                              }

                              // actualizar input (ESTO ES LO QUE TE FALTABA)
                              setFormData((prev) => ({
                                ...prev,
                                serial: value,
                              }));
                            }}
                            onSearch={() =>
                              handleSearchSerial(
                                formData.type.toLowerCase(),
                                "serial",
                                "capacidad",
                                "estado",
                              )
                            }
                            className={
                              searchErrors.serial ? "border-red-500" : ""
                            }
                          />

                          {/* MENSAJE ESTILIZADO DEBAJO DEL INPUT */}
                          {searchMessages.serial && (
                            <p
                              className={`text-xs mt-1 transition-all duration-200 ${
                                searchErrors.serial
                                  ? "text-red-500 font-medium"
                                  : "text-emerald-600 font-medium"
                              }`}
                            >
                              {searchMessages.serial}
                            </p>
                          )}
                        </div>
                      )}

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
                      Marca <span className="text-red-500">*</span>
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
                    {/* Memoria RAM (Soporte Múltiple) */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-black mb-1 uppercase">
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
                                setFormData({
                                  ...formData,
                                  ramList: newRamList,
                                });
                              }}
                            >
                              <option value="">
                                -- Seleccione Capacidad --
                              </option>
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
                                setFormData({
                                  ...formData,
                                  ramList: newRamList,
                                });
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

                    {/* Disco Duro (Soporte Múltiple) */}
                    <div className="space-y-3 mt-4">
                      <label className="block text-xs font-bold text-black mb-1 uppercase">
                        Discos Duros / Almacenamiento
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
                                const newStorageList = [
                                  ...formData.storageList,
                                ];
                                newStorageList[index].capacity = e.target.value;
                                setFormData({
                                  ...formData,
                                  storageList: newStorageList,
                                });
                              }}
                            >
                              <option value="">
                                -- Seleccione Capacidad --
                              </option>
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
                                const newStorageList = [
                                  ...formData.storageList,
                                ];
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
                    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">
                      Periféricos Asignados a esta Torre
                    </h3>

                    {/* Monitor */}
                    <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer w-fit">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-400"
                          checked={formData.hasMonitor}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hasMonitor: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm font-bold text-blue-800 uppercase tracking-wide">
                          Incluir Monitor
                        </span>
                      </label>

                      {formData.hasMonitor && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in duration-300">
                          <div className="md:col-span-6">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Serial del Monitor
                            </label>
                            <SerialSearchInput
                              placeholder="S/N Monitor..."
                              inputClassName="py-1.5 focus:ring-1 focus:ring-blue-400 rounded-l-md"
                              buttonColor="bg-blue-600 hover:bg-blue-700 rounded-r-md"
                              buttonIconSize={16}
                              value={formData.monitorSerial}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  monitorSerial: e.target.value,
                                })
                              }
                              // BUSCADOR EN BASE DE DATOS: tabla 'monitor'
                              onSearch={() =>
                                handleSearchSerial2("monitor", "monitorSerial")
                              }
                            />
                            {searchMessages.monitorSerial && (
                              <p
                                className={`text-xs mt-1 ${
                                  searchErrors.monitorSerial
                                    ? "text-red-500 font-medium"
                                    : "text-emerald-600 font-medium"
                                }`}
                              >
                                {searchMessages.monitorSerial}
                              </p>
                            )}
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Marca
                            </label>
                            <select
                              className="w-full h-10 border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-blue-400"
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

                    {/* Teclado */}
                    <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer w-fit">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-400"
                          checked={formData.hasKeyboard}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hasKeyboard: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm font-bold text-blue-800 uppercase tracking-wide">
                          Incluir Teclado
                        </span>
                      </label>

                      {formData.hasKeyboard && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in duration-300">
                          <div className="md:col-span-6">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Serial del Teclado
                            </label>
                            <SerialSearchInput
                              placeholder="S/N Teclado..."
                              inputClassName="py-1.5 focus:ring-1 focus:ring-blue-400 rounded-l-md"
                              buttonColor="bg-blue-600 hover:bg-blue-700 rounded-r-md"
                              buttonIconSize={16}
                              value={formData.keyboardSerial}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  keyboardSerial: e.target.value,
                                })
                              }
                              // BUSCADOR EN BASE DE DATOS: tabla 'teclado'
                              onSearch={() =>
                                handleSearchSerial2(
                                  "teclados",
                                  "keyboardSerial",
                                )
                              }
                            />
                            {searchMessages.keyboardSerial && (
                              <p
                                className={`text-xs mt-1 ${
                                  searchErrors.keyboardSerial
                                    ? "text-red-500 font-medium"
                                    : "text-emerald-600 font-medium"
                                }`}
                              >
                                {searchMessages.keyboardSerial}
                              </p>
                            )}
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Marca
                            </label>
                            <select
                              className="w-full h-10 border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-blue-400"
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

                    {/* Mouse */}
                    <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer w-fit">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-400"
                          checked={formData.hasMouse}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hasMouse: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm font-bold text-blue-800 uppercase tracking-wide">
                          Incluir Mouse
                        </span>
                      </label>

                      {formData.hasMouse && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in duration-300">
                          <div className="md:col-span-6">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Serial del Mouse
                            </label>
                            <SerialSearchInput
                              placeholder="S/N Mouse..."
                              inputClassName="py-1.5 focus:ring-1 focus:ring-blue-400 rounded-l-md"
                              buttonColor="bg-blue-600 hover:bg-blue-700 rounded-r-md"
                              buttonIconSize={16}
                              value={formData.mouseSerial}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  mouseSerial: e.target.value,
                                })
                              }
                              // BUSCADOR EN BASE DE DATOS: tabla 'mouse'
                              onSearch={() =>
                                handleSearchSerial2("mouse", "mouseSerial")
                              }
                            />
                            {searchMessages.mouseSerial && (
                              <p
                                className={`text-xs mt-1 ${
                                  searchErrors.mouseSerial
                                    ? "text-red-500 font-medium"
                                    : "text-emerald-600 font-medium"
                                }`}
                              >
                                {searchMessages.mouseSerial}
                              </p>
                            )}
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Marca
                            </label>
                            <select
                              className="w-full h-10 border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-blue-400"
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

                    {/* Cornetas */}
                    <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer w-fit">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-400"
                          checked={formData.hasSpeakers}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hasSpeakers: e.target.checked,
                            })
                          }
                        />
                        <span className="text-sm font-bold text-blue-800 uppercase tracking-wide">
                          Incluir Cornetas
                        </span>
                      </label>

                      {formData.hasSpeakers && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in duration-300">
                          <div className="md:col-span-6">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Serial de las Cornetas
                            </label>
                            <SerialSearchInput
                              placeholder="S/N Cornetas..."
                              inputClassName="py-1.5 focus:ring-1 focus:ring-blue-400 rounded-l-md"
                              buttonColor="bg-blue-600 hover:bg-blue-700 rounded-r-md"
                              buttonIconSize={16}
                              value={formData.speakersSerial}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  speakersSerial: e.target.value,
                                })
                              }
                              // BUSCADOR EN BASE DE DATOS: tabla 'corneta'
                              onSearch={() =>
                                handleSearchSerial2(
                                  "cornetas",
                                  "speakersSerial",
                                )
                              }
                            />
                            {searchMessages.speakersSerial && (
                              <p
                                className={`text-xs mt-1 ${
                                  searchErrors.speakersSerial
                                    ? "text-red-500 font-medium"
                                    : "text-emerald-600 font-medium"
                                }`}
                              >
                                {searchMessages.speakersSerial}
                              </p>
                            )}
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-black mb-1 uppercase">
                              Marca
                            </label>
                            <select
                              className="w-full h-10 border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-blue-400"
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-sm font-bold text-blue-800 uppercase">
                      Procedencia del Equipo
                    </h3>
                  </div>
                  {/* REFACTORIZADO CON LocationSelector */}
                  <LocationSelector
                    radioGroupName="procedencia_default"
                    formData={formData}
                    setFormData={setFormData}
                    handleDefaultLocation={handleDefaultLocation}
                    typePrefix="P" // Importante: agrega la 'P' a regionP, estadoP, etc.
                  />
                </div>

                {/* ASIGNACION DE ALMACÉN (REFACTORIZADO COMPLETO) */}
                <div className="pt-6 border-t border-gray-200 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-sm font-bold text-blue-800 uppercase">
                      Asignación de Almacén
                    </h3>
                  </div>
                  {/* REFACTORIZADO CON LocationSelector */}
                  <LocationSelector
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
