import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiX,
  FiTrash2,
  FiMonitor,
  FiTag,
  FiMapPin,
  FiSettings,
  FiCpu,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

// IMPORTACIONES PARA EL FORMULARIO REUTILIZABLE
import EquipoForm from "../Equipos/EquipoForm";
import { mapEquipoToForm } from "../../utils/mapEquipoToForm";
import { z } from "zod";
import { buildPayload } from "../../utils/buildPayload";
import { equipoSchema } from "../../validators/equipoSchema";
import { perifericoSchema } from "../../validators/perifericoSchema";

export default function EquiposModal({
  isOpen,
  onClose,
  item, // Representa el equipo o periférico seleccionado en la tabla primaria
  type, // "view" | "edit" | "delete"
  categoria, // "equipos" o "perifericos"
  onItemUpdated,
}) {
  // =========================
  // ESTADOS
  // =========================
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados para el formulario reutilizable (Modo Edit)
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // HELPER: Garantiza que el 'tipo' coincida exactamente con las opciones del formulario
  // Esto evita que el formulario muestre el select de "Selecciona una opción"
  const normalizarTipoParaFormulario = (tipoCrudo) => {
    if (!tipoCrudo) return "";
    const lower = tipoCrudo.toLowerCase().trim();
    if (lower === "pc") return "PC";
    if (lower === "laptop") return "Laptop";
    if (lower === "monitor") return "Monitor";
    if (lower === "teclado") return "Teclado";
    if (lower === "mouse") return "Mouse";
    if (lower === "switch") return "Switch";
    if (lower === "impresora") return "Impresora";
    if (lower === "corneta" || lower === "cornetas") return "Corneta";
    return tipoCrudo; // Fallback
  };

  // =========================
  // EFECTO: INICIALIZAR DATOS RÁPIDOS PARA EDICIÓN
  // =========================
  useEffect(() => {
    if (isOpen && item && type === "edit") {
      // Mapeo inicial rápido
      const initialData = mapEquipoToForm(item);
      // Garantizamos que el tipo esté normalizado para que EquipoForm no se confunda
      initialData.type = normalizarTipoParaFormulario(item.tipo);
      setFormData(initialData);
    }
  }, [isOpen, item, type]);

  // =========================
  // EFECTO: CARGAR DETALLES PROFUNDOS (VISTA Y EDICIÓN)
  // =========================
  useEffect(() => {
    if (!isOpen || !item || (type !== "view" && type !== "edit")) {
      if (!isOpen) {
        setDetalle(null);
        setFormData({});
      }
      return;
    }

    const fetchDetalleCompleto = async () => {
      try {
        setLoading(true);
        const itemId =
          item.id_equipo || item.id_periferico || item.id || item.itemId;

        // 1. Normalizamos a minúsculas para evitar fallas de tipado
        const tipoLower = (item.tipo || "").toLowerCase().trim();
        const catLower = (categoria || "").toLowerCase().trim();

        // 2. Clasificación inteligente del endpoint objetivo
        let endpointReal = "perifericos";
        if (
          tipoLower === "pc" ||
          tipoLower === "laptop" ||
          catLower === "equipos" ||
          catLower === "pc" ||
          catLower === "laptop"
        ) {
          endpointReal = "equipos";
        }

        // 3. Ejecutamos la petición con la ruta e ID correctos
        const response = await axios.get(
          `/api/${endpointReal}/${itemId}`,
        );
        console.log("RESPUESTA API", response.data);
        setDetalle(response.data);

        // Si estamos en modo edición, actualizamos el formulario con toda la data profunda (RAMs, discos, periféricos)
        if (type === "edit") {
          const deepData = mapEquipoToForm(response.data);
          deepData.type = normalizarTipoParaFormulario(
            response.data.tipo || item.tipo,
          );
          setFormData(deepData);
        }
      } catch (error) {
        console.error("Error al recuperar información del servidor:", error);
        toast.error("No se pudo sincronizar el detalle del activo.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetalleCompleto();
  }, [isOpen, item, type, categoria]);

  // =========================
  // ACCIÓN: MANDAR ACTUALIZACIÓN (PUT)
  // =========================
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const tipoDispositivo = formData.type?.toUpperCase();

    const esEquipo =
      tipoDispositivo === "PC" ||
      tipoDispositivo === "LAPTOP" ||
      tipoDispositivo === "SERVIDOR" ||
      tipoDispositivo === "ALL IN ONE" ||
      tipoDispositivo === "MINI PC";

    try {
      console.log("Datos a validar:", formData);

      if (esEquipo) {
        equipoSchema.parse(formData);
      } else {
        perifericoSchema.parse(formData);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(error.flatten().fieldErrors);

        const errores = error.flatten().fieldErrors;
        const firstError = Object.values(errores).flat()[0];

        toast.error(firstError || "Formulario inválido");
      } else {
        toast.error("Ocurrió un error inesperado.");
      }

      setIsSubmitting(false);
      return;
    }

    const payload = buildPayload(formData);

    payload.componentes ??= [];
    payload.perifericos ??= [];

    const itemId =
      item.id_equipo || item.id_periferico || item.id || item.itemId;

    let url = "";

    if (esEquipo) {
      url = `/api/equipos/${itemId}`;
    } else {
      url = `/api/perifericos/${formData.type}/${itemId}`;
    }

    toast
      .promise(axios.put(url, payload, { withCredentials: true }), {
        loading: "Guardando cambios...",
        success: (response) => {
          onItemUpdated?.();
          setTimeout(() => onClose(), 1000);

          return response.data.message || "Registro editado con éxito";
        },
        error: (error) =>
          error.response?.data?.message || "Error al editar el registro",
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // =========================
  // ACCIÓN: ELIMINACIÓN LÓGICA (PUT)
  // =========================
  const handleDelete = async () => {
    const itemId =
      item.id_equipo || item.id_periferico || item.id || item.itemId;
    const peticionEliminacion = axios.put(
      `/api/${categoria}/eliminado/${itemId}`,
    );

    toast.promise(peticionEliminacion, {
      loading: "Eliminando registro...",
      success: (response) => {
        if (onItemUpdated) onItemUpdated();
        onClose();
        return response.data.message || "Registro desincorporado correctamente";
      },
      error: (error) =>
        error.response?.data?.message || "Error al desincorporar el registro",
    });
  };

  // =========================
  // PROCESAMIENTO SEGURO DE UBICACIÓN EN VISTA
  // =========================
  const targetData = type === "view" ? detalle || item : item;

  // Extraemos dinámicamente priorizando la asignación
  const locActual =
    targetData?.asignacion || targetData?.ubicacion || targetData;
  const ubicacionTexto = locActual
    ? `${locActual.sede || ""} - ${locActual.ciudad || locActual.city || ""} - Piso ${locActual.piso || ""}${
        locActual.ala || locActual.alas
          ? ` - Ala ${locActual.ala || locActual.alas}`
          : ""
      }`
    : "";

  // Helper para verificar si es periférico de forma estricta
  const esPeriferico =
    categoria === "perifericos" ||
    (detalle?.tipo &&
      !["pc", "laptop", "cpu"].includes(detalle.tipo.toLowerCase()));

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[95vh] flex flex-col">
        {/* HEADER */}
        <div className="bg-primary-900 px-8 py-5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {type === "view" && "Detalles de Inventario"}
              {type === "edit" && "Editar Activo Tecnológico"}
              {type === "delete" && "Desincorporar Activo"}
            </h2>
            <p className="text-primary-100 text-sm mt-1">
              {type === "view" &&
                "Información de especificaciones, componentes y dependencias jerárquicas."}
              {type === "edit" &&
                "Actualiza los datos técnicos e infraestructura física del activo."}
              {type === "delete" &&
                "Esta acción marcará el estado del activo como desincorporado o inactivo."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded-xl p-2 transition-all"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* CONTENEDOR DESPLAZABLE */}
        <div className="overflow-y-auto flex-1">
          {/* MODO VISTA (VIEW) */}
          {type === "view" && (
            <div className="p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-medium text-sm animate-pulse">
                    Sincronizando con base de datos...
                  </p>
                </div>
              ) : detalle ? (
                <div className="space-y-6">
                  {/* GRID DE DATOS MAESTROS GENERALES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <FiMonitor className="text-primary-600 w-5 h-5" />
                        <h3 className="font-bold text-gray-800">
                          Identificación del Activo
                        </h3>
                      </div>
                      <div className="space-y-3 text-sm">
                        <p>
                          <span className="font-semibold text-gray-500">
                            Tipo:
                          </span>{" "}
                          <span className="font-bold text-gray-800">
                            {detalle.tipo}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold text-gray-500">
                            Marca:
                          </span>{" "}
                          <span className="text-gray-700">{detalle.marca}</span>
                        </p>
                        <p>
                          <span className="font-semibold text-gray-500">
                            Modelo:
                          </span>{" "}
                          <span className="text-gray-700">
                            {detalle.modelo}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <FiTag className="text-primary-600 w-5 h-5" />
                        <h3 className="font-bold text-gray-800">
                          Control de Inventario
                        </h3>
                      </div>
                      <div className="space-y-3 text-sm">
                        <p>
                          <span className="font-semibold text-gray-500">
                            Serial S/N:
                          </span>{" "}
                          <span className="font-mono bg-white px-2 py-0.5 rounded border font-semibold text-gray-800">
                            {detalle.serial}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold text-gray-500">
                            Estado Físico:
                          </span>{" "}
                          <span
                            className={`font-bold ${
                              detalle.estado === "Bueno" ||
                              detalle.estado === "Operativo"
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            {detalle.estado}
                          </span>
                        </p>
                        {esPeriferico && (
                          <p>
                            <span className="font-semibold text-gray-500">
                              Acoplamiento:
                            </span>{" "}
                            {detalle.equipoRelacionado ? (
                              <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                                Vinculado a {detalle.equipoRelacionado.tipo}
                              </span>
                            ) : (
                              <span className="text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200 text-xs">
                                Disponible / En Stock
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <FiSettings className="text-primary-600 w-5 h-5" />
                        <h3 className="font-bold text-gray-800">
                          Notas u Observaciones
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 italic">
                        {detalle.notas ||
                          "Sin observaciones o incidencias registradas en el sistema."}
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <FiMapPin className="text-primary-600 w-5 h-5" />
                        <h3 className="font-bold text-gray-800">
                          {esPeriferico
                            ? "Ubicación de Asignación (Actual)"
                            : "Ubicación Geográfica / Técnica"}
                        </h3>
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        {ubicacionTexto ||
                          "Sin asignación geográfica registrada."}
                      </p>
                    </div>
                  </div>

                  {/* --- RENDERIZADO SUB-DATOS DE EQUIPOS (PC / LAPTOP) --- */}
                  {!esPeriferico && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t pt-5">
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <FiCpu className="text-primary-600 w-5 h-5" />
                          <h3 className="font-bold text-gray-800">
                            Componentes de Hardware Interno
                          </h3>
                        </div>
                        <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                          {detalle.componentes &&
                          detalle.componentes.length > 0 ? (
                            detalle.componentes.map((comp, idx) => (
                              <div
                                key={idx}
                                className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center text-sm"
                              >
                                <div>
                                  <p className="font-bold text-gray-800">
                                    {comp.tipo?.replace("_", " ")}
                                  </p>
                                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                                    S/N: {comp.serial}
                                  </p>
                                  <p className="text-[11px] text-gray-500 mt-0.5">
                                    {comp.marca} · Mod: {comp.modelo}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                  {comp.capacidad && (
                                    <span className="bg-primary-50 text-primary-700 font-extrabold px-2 py-0.5 rounded-lg text-xs border border-primary-100">
                                      {comp.capacidad}
                                    </span>
                                  )}
                                  <span
                                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                      comp.estado === "Bueno"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    {comp.estado}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-400 italic">
                              No posee componentes de hardware interno asignados
                              en el esquema.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <FiMonitor className="text-primary-600 w-5 h-5" />
                          <h3 className="font-bold text-gray-800">
                            Periféricos de Estación de Trabajo
                          </h3>
                        </div>
                        <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                          {detalle.perifericos &&
                          detalle.perifericos.length > 0 ? (
                            detalle.perifericos.map((peri, idx) => (
                              <div
                                key={idx}
                                className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center text-sm"
                              >
                                <div>
                                  <p className="font-bold text-gray-800">
                                    {peri.tipo}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {peri.marca} {peri.modelo}
                                  </p>
                                  <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                                    S/N: {peri.serial}
                                  </p>
                                </div>
                                <span
                                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                    peri.estado === "Bueno" ||
                                    peri.estado === "Operativo"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  {peri.estado}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-400 italic">
                              Esta estación de trabajo no reporta periféricos
                              enlazados.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- RENDERIZADO SUB-DATOS DE PERIFÉRICOS INDIVIDUALES --- */}
                  {esPeriferico && (
                    <div className="border-t pt-5">
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <FiSettings className="text-primary-600 w-5 h-5" />
                          <h3 className="font-bold text-gray-800">
                            Relación de Acoplamiento e Infraestructura
                          </h3>
                        </div>

                        {detalle.equipoRelacionado ? (
                          <div className="bg-white p-4 rounded-xl border border-primary-100 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-center text-sm">
                            <div>
                              <span className="text-xs text-gray-400 font-bold uppercase block">
                                Dispositivo Contenedor
                              </span>
                              <span className="font-bold text-gray-800 mt-0.5 block">
                                {detalle.equipoRelacionado.tipo}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-400 font-bold uppercase block">
                                Marca / Modelo
                              </span>
                              <span className="text-gray-700 mt-0.5 block">
                                {detalle.equipoRelacionado.marca}{" "}
                                {detalle.equipoRelacionado.modelo}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-400 font-bold uppercase block">
                                Serial del Equipo
                              </span>
                              <span className="font-mono bg-gray-50 px-2 py-0.5 border rounded text-xs text-primary-700 font-bold mt-0.5 inline-block">
                                {detalle.equipoRelacionado.serial}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="bg-green-100 text-green-800 font-extrabold text-[11px] px-3 py-1 rounded-full border border-green-200 uppercase">
                                Asignado / Activo
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-200 flex justify-between items-center text-sm">
                            <p className="text-yellow-800 font-medium">
                              Este periférico se encuentra libre en stock (no
                              está enlazado a ninguna estación o PC de la
                              Torre).
                            </p>
                            <span className="bg-yellow-100 text-yellow-800 font-bold text-xs px-2.5 py-1 rounded-full uppercase">
                              No Asignado
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center py-10 text-gray-400 text-sm">
                  Error crítico al estructurar los mapeos de datos.
                </p>
              )}
            </div>
          )}

          {/* MODO EDICIÓN (EDIT) */}
          {type === "edit" && (
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-medium text-sm animate-pulse">
                    Preparando formulario con dependencias...
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <EquipoForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleEditSubmit}
                    onCancel={onClose}
                    mode="edit"
                    isSubmitting={isSubmitting}
                  />
                </div>
              )}
            </div>
          )}

          {/* MODO ELIMINAR (DELETE) */}
          {type === "delete" && (
            <div className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="bg-red-100 p-5 rounded-full mb-5">
                  <FiTrash2 className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  ¿Desincorporar Activo?
                </h3>
                <p className="text-gray-600 max-w-md">
                  El elemento con serial{" "}
                  <strong className="font-mono text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">
                    {item.serial}
                  </strong>{" "}
                  cambiará su estado operativo e histórico en la base de datos
                  de CANTV.
                </p>
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={onClose}
                    className="px-5 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg"
                  >
                    <FiTrash2 />
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
