import React, { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import UbicacionModal from "./UbicacionModal";
import UbicacionActionModal from "./UbicacionActionModal";
import axios from "axios";
import {
  FiSearch,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiMoreVertical,
  FiEye,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";

const getRowKey = (ubi, idx) => ubi.id || `${ubi.sede}-${ubi.piso}-${idx}`;

export default function Ubicacion() {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null,
    ubicacion: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const obtenerUbicaciones = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/ubicaciones",
        { withCredentials: true },
      );
      setUbicaciones(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error obteniendo ubicaciones:", error);
      setUbicaciones([]);
    }
  };

  useEffect(() => {
    obtenerUbicaciones();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const ubicacionesFiltradas = ubicaciones.filter((ubi) => {
    const termino = searchTerm.toLowerCase().trim();
    if (!termino) return true;

    const campos = [
      ubi.region,
      ubi.estado,
      ubi.ciudad,
      ubi.sede,
      ubi.piso,
      ubi.ala,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return campos.includes(termino);
  });

  const totalPages = Math.ceil(ubicacionesFiltradas.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ubicacionesFiltradas.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    setActiveDropdown(null);
  };

  const toggleDropdown = (rowKey) => {
    setActiveDropdown(activeDropdown === rowKey ? null : rowKey);
  };

  const handleOpenModal = (type, ubicacion) => {
    setModalConfig({ isOpen: true, type, ubicacion });
    setActiveDropdown(null);
  };

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false, type: null, ubicacion: null });
  };

  const renderActionMenu = (ubi, rowKey, align = "right") => (
    <div className="relative">
      <button
        onClick={() => toggleDropdown(rowKey)}
        className="text-gray-400 hover:text-gray-900 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Acciones"
      >
        <FiMoreVertical className="w-5 h-5" />
      </button>

      {activeDropdown === rowKey && (
        <div
          className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-[9999]"
        >
          <button
            onClick={() => handleOpenModal("view", ubi)}
            className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 first:rounded-t-xl"
          >
            <FiEye className="w-4 h-4" /> Ver más
          </button>
          <button
            onClick={() => handleOpenModal("edit", ubi)}
            className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <FiEdit className="w-4 h-4" /> Editar
          </button>
          <button
            onClick={() => handleOpenModal("delete", ubi)}
            className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100 last:rounded-b-xl"
          >
            <FiTrash2 className="w-4 h-4" /> Eliminar
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Ubicaciones
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Visualiza y registra las ubicaciones de los depósitos.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="px-4 sm:px-8 py-5 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiMapPin className="w-5 h-5 text-primary-600" />
                Ubicaciones Registradas
              </h2>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-all whitespace-nowrap"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Agregar Ubicación
                </button>
              </div>
            </div>
          </div>

          {/* Vista móvil */}
          <div className="block md:hidden divide-y divide-gray-200">
            {currentItems.map((ubi, idx) => {
              const rowKey = getRowKey(ubi, idx);
              return (
                <div
                  key={rowKey}
                  className="p-4 bg-white flex flex-col gap-3 relative"
                >
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {ubi.sede}
                      </p>
                      <p className="text-xs text-gray-500">
                        Piso {ubi.piso}
                        {ubi.ala ? ` · Ala ${ubi.ala}` : ""}
                      </p>
                    </div>
                    {renderActionMenu(ubi, rowKey)}
                  </div>

                  <p className="text-sm text-gray-600">
                    {ubi.ciudad}, {ubi.estado}
                  </p>
                  <p className="text-xs text-gray-500">{ubi.region}</p>
                </div>
              );
            })}
          </div>

          {/* Vista escritorio */}
          <div className="hidden md:block w-full overflow-visible">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  {["Región", "Estado", "Ciudad", "Sede", "Piso", "Ala"].map(
                    (h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((ubi, idx) => {
                  const rowKey = getRowKey(ubi, idx);
                  return (
                    <tr
                      key={rowKey}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {ubi.region}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {ubi.estado}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {ubi.ciudad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ubi.sede}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {ubi.piso}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ubi.ala || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                        {renderActionMenu(ubi, rowKey, "table")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {ubicacionesFiltradas.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">
              {searchTerm
                ? "No se encontraron ubicaciones con ese criterio."
                : "No hay ubicaciones registradas todavía."}
            </div>
          )}

          {ubicacionesFiltradas.length > 0 && (
            <div className="px-4 py-4 sm:px-6 flex items-center justify-between border-t border-gray-200 bg-white rounded-b-2xl">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>

              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700">
                  Mostrando{" "}
                  <span className="font-semibold">{indexOfFirstItem + 1}</span>{" "}
                  al{" "}
                  <span className="font-semibold">
                    {Math.min(indexOfLastItem, ubicacionesFiltradas.length)}
                  </span>{" "}
                  de{" "}
                  <span className="font-semibold">
                    {ubicacionesFiltradas.length}
                  </span>{" "}
                  resultados
                </p>

                <nav className="relative z-0 inline-flex rounded-xl shadow-sm gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-xl border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <FiChevronLeft className="h-5 w-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-bold rounded-xl transition-all ${
                        currentPage === i + 1
                          ? "z-10 bg-primary-600 border-primary-600 text-white shadow-sm"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-xl border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </main>

      <UbicacionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onUbicacionCreada={obtenerUbicaciones}
      />

      <UbicacionActionModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        ubicacion={modalConfig.ubicacion}
        type={modalConfig.type}
        onUbicacionActualizada={obtenerUbicaciones}
      />
    </div>
  );
}
