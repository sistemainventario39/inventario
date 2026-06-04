import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
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
} from "react-icons/fi";

export default function Busqueda() {
  const [equipos, setEquipos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Estados de filtros múltiples
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch a la API
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/componentes",
        );
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
    selectedStatuses,
    selectedTypes,
    selectedModels,
    selectedLocations,
  ]);

  const handleCheckboxChange = (value, currentList, setList) => {
    if (currentList.includes(value)) {
      setList(currentList.filter((item) => item !== value));
    } else {
      setList([...currentList, value]);
    }
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleOpenModal = (action, equipo) => {
    console.log(`Abriendo modal de ${action} para el equipo:`, equipo);
    setActiveDropdown(null);
  };

  // Filtrado reactivo
  const filteredData = equipos.filter((item) => {
    const safeName = item.marca || "";
    const safeSerial = item.serial || "";

    const matchesSearch =
      safeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeSerial.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(item.estado_componente);
    const matchesType =
      selectedTypes.length === 0 || selectedTypes.includes(item.tipo);
    const matchesModel =
      selectedModels.length === 0 || selectedModels.includes(item.modelo);
    const matchesLocation =
      selectedLocations.length === 0 || selectedLocations.includes(item.sede);

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

  const options = {
    statuses: ["Bueno", "Defectuoso"],
    types: [
      "PC",
      "Laptop",
      "Cornetas",
      "Mouse",
      "Switches",
      "Teclados",
      "Impresoras",
      "Monitor",
    ],
    models: ["Vit", "Lenovo"],
    locations: ["Torre 30", "Torre Centro"],
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

          <div className="self-start md:self-auto px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-xs font-semibold tracking-wide shadow-sm">
            {filteredData.length}{" "}
            {filteredData.length === 1
              ? "equipo encontrado"
              : "equipos encontrados"}
          </div>
        </div>

        {/* CONTENEDOR DE BÚSQUEDA Y FILTROS */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-8 transition-all duration-300 hover:shadow-md">
          <div className="relative mb-8">
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

          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-6 border-t border-slate-100">
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
                key={`${item.tipo}-${item.id}`}
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
                      onClick={() => toggleDropdown(`${item.tipo}-${item.id}`)}
                      className="text-slate-400 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <FiMoreVertical className="w-5 h-5" />
                    </button>

                    {activeDropdown === `${item.tipo}-${item.id}` && (
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
                      item.estado_componente === "Bueno"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-rose-50 text-rose-700 border border-rose-100"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                        item.estado_componente === "Bueno"
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      }`}
                    />
                    {item.estado_componente}
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
                    key={`${item.tipo}-${item.id}`}
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
                          item.estado_componente === "Bueno"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                            item.estado_componente === "Bueno"
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        />
                        {item.estado_componente}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right relative">
                      <button
                        onClick={() =>
                          toggleDropdown(`${item.tipo}-${item.id}`)
                        }
                        className="text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100"
                      >
                        <FiMoreVertical className="w-5 h-5 mx-auto" />
                      </button>

                      {activeDropdown === `${item.tipo}-${item.id}` && (
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
    </div>
  );
}
