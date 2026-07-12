import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import axios from "axios";
import {
  FiSearch,
  FiSliders,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

export default function Bitacora() {
  const [bitacora, setBitacora] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // 1. NUEVO ESTADO: Para guardar las sedes de la API
  const [sedesOpciones, setSedesOpciones] = useState([]);

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchBitacora = async () => {
      try {
        const response = await axios.get("/api/bitacora", {
          withCredentials: true,
        });
        setBitacora(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error cargando bitácora:", error);
        setBitacora([]);
      }
    };

    // 2. NUEVA FUNCIÓN: Para obtener las sedes
    const fetchSedes = async () => {
      try {
        const response = await axios.get("/api/sede", {
          withCredentials: true, // Agregado por si tu API requiere autenticación
        });
        setSedesOpciones(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error cargando sedes:", error);
        setSedesOpciones([]);
      }
    };

    fetchBitacora();
    fetchSedes(); // Ejecutamos la petición de sedes al montar el componente
  }, []);

  // Filtrado reactivo
  const filteredData = bitacora.filter((item) => {
    const matchesSearch =
      item.usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.detalles?.some((detalle) =>
        detalle.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesLocation =
      selectedLocation === "" || item.sede === selectedLocation;

    const itemDate = new Date(item.fecha);
    itemDate.setHours(0, 0, 0, 0);

    const start = fechaInicio ? new Date(fechaInicio + "T00:00:00") : null;
    const end = fechaFin ? new Date(fechaFin + "T23:59:59") : null;

    const matchesDate =
      (!start || itemDate >= start) && (!end || itemDate <= end);

    return matchesSearch && matchesLocation && matchesDate;
  });

  // Lógica de Paginación Exacta
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Bitácora de Actividades
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 font-medium">
              Historial y seguimiento de operaciones realizadas en el sistema.
            </p>
          </div>

          <div className="self-start md:self-auto px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-xs font-semibold tracking-wide shadow-sm">
            {filteredData.length}{" "}
            {filteredData.length === 1
              ? "registro encontrado"
              : "registros encontrados"}
          </div>
        </div>

        {/* CONTENEDOR DE BÚSQUEDA Y FILTROS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="relative mb-6">
            <FiSearch className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por usuario o detalle del cambio..."
              className="pl-12 w-full bg-slate-50 border-slate-200 rounded-xl py-3 border focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Resetea a página 1 al buscar
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                Sede
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Todas las sedes</option>

                {/* 3. MAPEO DE OPCIONES DINÁMICAS */}
                {sedesOpciones.map((sede) => (
                  <option key={sede.id_sede} value={sede.nombre}>
                    {sede.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                value={fechaInicio}
                onChange={(e) => {
                  setFechaInicio(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                value={fechaFin}
                onChange={(e) => {
                  setFechaFin(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "ID",
                    "Usuario",
                    "Acción",
                    "Detalles",
                    "Sede",
                    "Fecha",
                    "ID Modificado",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-xs font-mono text-slate-500 truncate max-w-[100px]">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {item.usuario}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-600 font-medium whitespace-nowrap">
                        {item.accion}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.detalles && item.detalles.length > 0 ? (
                          <ul className="list-disc pl-4 space-y-1">
                            {item.detalles.map((detalle, idx) => (
                              <li key={idx}>{detalle}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-400 italic">
                            Sin detalles
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {item.sede}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {item.fecha
                          ? new Date(item.fecha).toLocaleString()
                          : "Sin fecha"}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500 truncate max-w-[120px]">
                        {item.id_modificado}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-16 text-center text-slate-400"
                    >
                      <FiSliders className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">
                        Sin resultados
                      </p>
                      <p className="text-xs text-slate-400">
                        No se encontraron registros en la bitácora con los
                        filtros seleccionados.
                      </p>
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
