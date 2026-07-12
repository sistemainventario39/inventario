import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import EquipoModal from "./Equipos/EquiposModal";
import ExportDownloadButton from "../components/ui/ExportDownloadButton";
import axios from "axios";
import {
  FiSearch,
  FiMoreVertical,
  FiSliders,
  FiEye,
  FiEdit,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { EqualIcon } from "lucide-react";

export default function Busqueda() {
  const [equipos, setEquipos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Estados de filtros múltiples (selección en el panel)
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  // Filtros aplicados (los que realmente filtran la tabla)
  const [appliedStatuses, setAppliedStatuses] = useState([]);
  const [appliedTypes, setAppliedTypes] = useState([]);
  const [appliedModels, setAppliedModels] = useState([]);
  const [appliedLocations, setAppliedLocations] = useState([]);
  const [showAppliedFilters, setShowAppliedFilters] = useState(false);

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Nuevos estados para controlar los modales
  const [modalState, setModalState] = useState({
    isOpen: false,
    action: null, // "view", "edit", "delete"
    itemData: null, // Datos limpios con su ID y categoría
  });

  // NUEVO: Estado para mostrar u ocultar los filtros
  const [showFilters, setShowFilters] = useState(false);

  // Función adaptada para buscar por ID y tabla específica
  const handleOpenModal = (action, item) => {
    // 1. Extraemos el ID exacto (soporta diferentes nombres de columna que pueda devolver la BD)
    const itemId = item.id_equipo || item.id_periferico || item.id;

    // 2. Determinamos la tabla/endpoint basándonos en el tipo de componente
    // Ej: Si item.tipo es "Laptop", la categoría será "laptop"
    const categoria = item.tipo ? item.tipo.toLowerCase() : "componentes";

    console.log(`Acción: ${action} | ID: ${itemId} | Tabla: ${categoria}`);

    // 3. Guardamos los datos procesados en el estado para que el Modal los consuma
    setModalState({
      isOpen: true,
      action: action,
      itemData: {
        ...item,
        itemId,
        categoria,
      },
    });

    // Cerramos el menú desplegable
    setActiveDropdown(null);
  };
  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      action: null,
      itemData: null,
    });
  };
  // Fetch a la API
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const response = await axios.get("/api/componentes", {
          withCredentials: true,
        });
        if (Array.isArray(response.data)) {
          setEquipos(response.data);
        } else {
          setEquipos([]);
        }
      } catch (error) {
        console.error("Error cargando el inventario:", error);
        // Recuerda usar aquí tu librería personalizada Showcustomealerts si tienes errores
        setEquipos([]);
      }
    };
    fetchEquipos();
  }, []);

  // Reiniciar a la página 1 cada vez que se aplica un filtro o se busca algo
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    appliedStatuses,
    appliedTypes,
    appliedModels,
    appliedLocations,
  ]);

  const handleCheckboxChange = (value, currentList, setList) => {
    if (currentList.includes(value)) {
      setList(currentList.filter((item) => item !== value));
    } else {
      setList([...currentList, value]);
    }
  };

  const handleApplyFilters = () => {
    setAppliedStatuses([...selectedStatuses]);
    setAppliedTypes([...selectedTypes]);
    setAppliedModels([...selectedModels]);
    setAppliedLocations([...selectedLocations]);
    setShowAppliedFilters(true);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setSelectedModels([]);
    setSelectedLocations([]);
    setAppliedStatuses([]);
    setAppliedTypes([]);
    setAppliedModels([]);
    setAppliedLocations([]);
    setShowAppliedFilters(false);
  };

  const hasAppliedFilters =
    appliedStatuses.length > 0 ||
    appliedTypes.length > 0 ||
    appliedModels.length > 0 ||
    appliedLocations.length > 0;

  const hasPendingFilters =
    selectedStatuses.length > 0 ||
    selectedTypes.length > 0 ||
    selectedModels.length > 0 ||
    selectedLocations.length > 0;

  const hasAnyFilters =
    hasAppliedFilters || hasPendingFilters || showAppliedFilters;

  const appliedFilterTags = [
    ...appliedStatuses.map((value) => ({ label: "Estado", value })),
    ...appliedTypes.map((value) => ({ label: "Componente", value })),
    ...appliedModels.map((value) => ({ label: "Modelo", value })),
    ...appliedLocations.map((value) => ({ label: "Ubicación", value })),
  ];

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Función auxiliar para obtener un ID único seguro para las keys y dropdowns
  const getUniqueId = (item) => item.id_equipo || item.id_periferico || item.id;

  // Filtrado reactivo
  const filteredData = equipos.filter((item) => {
    const safeName = item.marca || "";
    const safeSerial = item.serial || "";

    const matchesSearch =
      safeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeSerial.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      appliedStatuses.length === 0 || appliedStatuses.includes(item.estado);
    const matchesType =
      appliedTypes.length === 0 || appliedTypes.includes(item.tipo);
    const matchesModel =
      appliedModels.length === 0 || appliedModels.includes(item.modelo);
    const matchesLocation =
      appliedLocations.length === 0 || appliedLocations.includes(item.sede);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesModel &&
      matchesLocation
    );
  });

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const dedupeByKey = (items, getKey) => {
    const map = new Map();
    items.forEach((item) => {
      const key = getKey(item);
      if (key && !map.has(key)) map.set(key, item);
    });
    return [...map.values()];
  };

  const options = {
    statuses: ["Bueno", "Dañado", "Repuesto"],
    types: dedupeByKey(
      equipos.map((item) => item.tipo).filter(Boolean),
      (tipo) => tipo.trim().toLowerCase(),
    ).sort((a, b) => a.localeCompare(b, "es")),
    models: [
      ...new Set(equipos.map((item) => item.modelo).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b, "es")),
    locations: [
      ...new Set(equipos.map((item) => item.sede).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b, "es")),
  };

  const exportFilters = {
    searchTerm,
    selectedStatuses: appliedStatuses,
    selectedTypes: appliedTypes,
    selectedModels: appliedModels,
    selectedLocations: appliedLocations,
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased overflow-x-hidden">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Búsqueda de Equipos
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 font-medium">
              Gestiona e identifica hardware e infraestructura en tiempo real.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-auto">
            <ExportDownloadButton filters={exportFilters} />
            <div className="px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-xs font-semibold tracking-wide shadow-sm">
              {filteredData.length}{" "}
              {filteredData.length === 1
                ? "equipo encontrado"
                : "equipos encontrados"}
            </div>
          </div>
        </div>

        {/* CONTENEDOR DE BÚSQUEDA Y FILTROS */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-8 transition-all duration-300 hover:shadow-md">
          {/* Fila del buscador y botón de filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Escribe el nombre de un equipo o su número de serie..."
                className="pl-12 block w-full bg-slate-50/50 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl shadow-inner py-3 px-4 sm:text-sm border transition-all placeholder:text-slate-400 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Botón para alternar filtros */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-5 py-3 border rounded-xl font-medium transition-all duration-200 sm:w-auto w-full shrink-0 ${
                showFilters
                  ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <FiSliders className="w-4 h-4" />
              Filtros
              {showFilters ? (
                <FiChevronUp className="w-4 h-4 ml-1" />
              ) : (
                <FiChevronDown className="w-4 h-4 ml-1" />
              )}
            </button>

            <button
              type="button"
              onClick={handleApplyFilters}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 sm:w-auto w-full shrink-0"
            >
              Aplicar filtros
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              disabled={!hasAnyFilters}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 shadow-sm transition-all duration-200 sm:w-auto w-full shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Limpiar filtros
            </button>
          </div>

          {/* NUEVO: Contenedor colapsable de Filtros (El "Acordeón") */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showFilters
                ? "max-h-[1200px] opacity-100 pt-6 mt-4 border-t border-slate-100"
                : "max-h-0 opacity-0 pt-0 mt-0 border-transparent"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Estado */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-slate-400">
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Estado
                  </span>
                </div>
                <div className="space-y-2.5">
                  {options.statuses.map((status) => {
                    const isChecked = selectedStatuses.includes(status);
                    return (
                      <label
                        key={status}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer select-none ${isChecked ? "bg-blue-50/60 border-blue-200 text-blue-700 shadow-sm" : "bg-transparent border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200"}`}
                      >
                        <input
                          type="checkbox"
                          className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/30 h-4 w-4 transition-all"
                          checked={isChecked}
                          onChange={() =>
                            handleCheckboxChange(
                              status,
                              selectedStatuses,
                              setSelectedStatuses,
                            )
                          }
                        />
                        <span>{status}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Componente */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-slate-400">
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Componente
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {options.types.map((type) => {
                    const isChecked = selectedTypes.includes(type);
                    return (
                      <label
                        key={type}
                        className={`flex items-center space-x-2 px-2.5 py-2 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer select-none ${isChecked ? "bg-blue-50/60 border-blue-200 text-blue-700 shadow-sm" : "bg-transparent border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200"}`}
                      >
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 h-3.5 w-3.5 transition-all"
                          checked={isChecked}
                          onChange={() =>
                            handleCheckboxChange(
                              type,
                              selectedTypes,
                              setSelectedTypes,
                            )
                          }
                        />
                        <span className="truncate">{type}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modelo */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-slate-400">
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Modelo
                  </span>
                </div>
                <div className="space-y-2.5">
                  {options.models.map((model) => {
                    const isChecked = selectedModels.includes(model);
                    return (
                      <label
                        key={model}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer select-none ${isChecked ? "bg-blue-50/60 border-blue-200 text-blue-700 shadow-sm" : "bg-transparent border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200"}`}
                      >
                        <input
                          type="checkbox"
                          className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/30 h-4 w-4 transition-all"
                          checked={isChecked}
                          onChange={() =>
                            handleCheckboxChange(
                              model,
                              selectedModels,
                              setSelectedModels,
                            )
                          }
                        />
                        <span>{model}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Torre */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-slate-400">
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Torre Ubicación
                  </span>
                </div>
                <div className="space-y-2.5">
                  {options.locations.map((loc) => {
                    const isChecked = selectedLocations.includes(loc);
                    return (
                      <label
                        key={loc}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer select-none ${isChecked ? "bg-blue-50/60 border-blue-200 text-blue-700 shadow-sm" : "bg-transparent border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200"}`}
                      >
                        <input
                          type="checkbox"
                          className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/30 h-4 w-4 transition-all"
                          checked={isChecked}
                          onChange={() =>
                            handleCheckboxChange(
                              loc,
                              selectedLocations,
                              setSelectedLocations,
                            )
                          }
                        />
                        <span>{loc}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {showAppliedFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Filtros aplicados
              </p>
              {hasAppliedFilters ? (
                <div className="flex flex-wrap gap-2">
                  {appliedFilterTags.map((tag) => (
                    <span
                      key={`${tag.label}-${tag.value}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100"
                    >
                      <span className="text-blue-500">{tag.label}:</span>
                      {tag.value}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No hay filtros seleccionados. Marca opciones y pulsa
                  &quot;Aplicar filtros&quot;.
                </p>
              )}
            </div>
          )}
        </div>

        {/* TABLA RESPONSIVA CON PAGINACIÓN */}
        {/* TABLA RESPONSIVA */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden">
          {/* CABECERA */}
          <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">
              Equipos Registrados
            </h2>
          </div>

          {/* =========================================
      VISTA MÓVIL
  ========================================= */}
          <div className="block md:hidden divide-y divide-slate-100">
            {currentItems.map((item) => (
              <div
                key={`${item.tipo}-${getUniqueId(item)}`}
                className="p-4 flex flex-col gap-3 bg-white relative"
              >
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-slate-500">
                      Serial:
                    </span>

                    <span className="font-mono text-sm font-bold bg-slate-100 px-2 py-1 rounded">
                      {item.serial}
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() =>
                        toggleDropdown(`${item.tipo}-${getUniqueId(item)}`)
                      }
                      className="text-slate-400 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <FiMoreVertical className="w-5 h-5" />
                    </button>

                    {activeDropdown === `${item.tipo}-${getUniqueId(item)}` && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-200 z-[9999]">
                        <button
                          onClick={() => handleOpenModal("view", item)}
                          className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FiEye className="w-4 h-4" />
                          Ver más
                        </button>

                        <button
                          onClick={() => handleOpenModal("edit", item)}
                          className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FiEdit className="w-4 h-4" />
                          Editar
                        </button>

                        <button
                          onClick={() => handleOpenModal("delete", item)}
                          className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-slate-500">
                    Tipo:
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {item.tipo}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-slate-500">
                    Marca:
                  </span>
                  <span className="text-sm text-slate-800">{item.marca}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-slate-500">
                    Modelo:
                  </span>
                  <span className="text-sm text-slate-800">{item.modelo}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-slate-500">
                    Ubicación:
                  </span>
                  <span className="text-sm text-slate-800">{item.sede}</span>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-slate-500">
                    Estado:
                  </span>

                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                      item.estado === "Bueno"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-rose-50 text-rose-700 border border-rose-100"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                        item.estado === "Bueno"
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      }`}
                    />
                    {item.estado}
                  </span>
                </div>
              </div>
            ))}

            {currentItems.length === 0 && (
              <div className="px-6 py-16 text-center text-slate-400">
                <FiSliders className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  Sin resultados
                </p>
                <p className="text-xs text-slate-400">
                  No hay ningún equipo que coincida con los filtros
                  seleccionados.
                </p>
              </div>
            )}
          </div>

          {/* =========================================
      VISTA ESCRITORIO
  ========================================= */}
          <div className="hidden md:block">
            <table className="w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/70 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Número de Serie
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Marca
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Modelo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="relative px-6 py-4">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-100">
                {currentItems.map((item) => (
                  <tr
                    key={`${item.tipo}-${getUniqueId(item)}`}
                    className="hover:bg-slate-50/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      {item.tipo}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                      <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 inline-block">
                        {item.serial}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                        {item.marca}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                        {item.modelo}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {item.sede}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                          item.estado === "Bueno"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                            item.estado === "Bueno"
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        />
                        {item.estado}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right relative">
                      <button
                        onClick={() =>
                          toggleDropdown(`${item.tipo}-${getUniqueId(item)}`)
                        }
                        className="text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100"
                      >
                        <FiMoreVertical className="w-5 h-5 mx-auto" />
                      </button>

                      {activeDropdown ===
                        `${item.tipo}-${getUniqueId(item)}` && (
                        <div className="absolute right-12 top-0 w-40 bg-white rounded-xl shadow-xl border border-slate-200 z-[9999]">
                          <button
                            onClick={() => handleOpenModal("view", item)}
                            className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiEye className="w-4 h-4" />
                            Ver más
                          </button>

                          <button
                            onClick={() => handleOpenModal("edit", item)}
                            className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiEdit className="w-4 h-4" />
                            Editar
                          </button>

                          <button
                            onClick={() => handleOpenModal("delete", item)}
                            className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {currentItems.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-16 text-center text-slate-400"
                    >
                      Sin resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* CONTROLES DE PAGINACIÓN */}
          {filteredData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-4 sm:mb-0">
                Mostrando{" "}
                <span className="font-semibold text-slate-700">
                  {indexOfFirstItem + 1}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(indexOfLastItem, filteredData.length)}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-slate-700">
                  {filteredData.length}
                </span>{" "}
                resultados
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Siguiente <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <EquipoModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        item={modalState.itemData}
        type={modalState.action}
        categoria={modalState.itemData?.categoria}
      />
    </div>
  );
}
