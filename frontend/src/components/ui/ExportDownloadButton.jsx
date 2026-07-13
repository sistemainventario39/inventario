import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FiDownload, FiFileText, FiGrid } from "react-icons/fi";


function dedupeTipos(tipos) {
  const vistos = new Set();
  return tipos.filter((tipo) => {
    const key = normalize(tipo);
    if (!key || vistos.has(key)) return false;
    vistos.add(key);
    return true;
  });
}
const normalize = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function ExportDownloadButton({ filters = {} }) {
  const [tipos, setTipos] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const response = await axios.get(`/api/export/tipos`, {
          withCredentials: true,
        });
        if (Array.isArray(response.data)) {
          setTipos(dedupeTipos(response.data));
        }
      } catch (error) {
        console.error("Error cargando tipos de equipos:", error);
      }
    };

    fetchTipos();
  }, []);

  const handleDownload = async (formato, tipo) => {
    if (isDownloading) return;

    const formatoLabel = formato === "pdf" ? "PDF" : "Excel";
    const tipoLabel = tipo === "completa" ? "información completa" : tipo;

    toast.loading(`Preparando descarga ${formatoLabel} — ${tipoLabel}...`, {
      id: "export-download",
    });

    setIsDownloading(true);

    try {
      const params = {
        formato,
        tipo,
        search: filters.searchTerm || "",
        estados: (filters.selectedStatuses || []).join(","),
        tipos: (filters.selectedTypes || []).join(","),
        modelos: (filters.selectedModels || []).join(","),
        sedes: (filters.selectedLocations || []).join(","),
      };

      const response = await axios.get(`/api/export/descargar`, {
        params,
        withCredentials: true,
        responseType: "blob",
      });

      const contentDisposition = response.headers["content-disposition"];
      let fileName = `inventario-${tipo}-${formato === "pdf" ? "pdf" : "xlsx"}`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) fileName = match[1];
      }

      const mimeType =
        formato === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Descarga ${formatoLabel} iniciada correctamente.`, {
        id: "export-download",
      });
    } catch (error) {
      let message = "Error al generar la descarga.";

      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          message = parsed.message || message;
        } catch {
          /* usar mensaje por defecto */
        }
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      toast.error(message, { id: "export-download" });
    } finally {
      setIsDownloading(false);
    }
  };

  const renderOption = (formato, tipo, label) => (
    <button
      key={`${formato}-${tipo}`}
      type="button"
      disabled={isDownloading}
      onClick={() => handleDownload(formato, tipo)}
      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );

  return (
    <div className="relative group inline-block">
      <button
        type="button"
        className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30"
      >
        <FiDownload className="w-4 h-4" />
        <span>Exportar</span>
        <span className="flex items-center gap-1 ml-1 pl-2 border-l border-white/30">
          <FiFileText className="w-3.5 h-3.5 opacity-90" title="PDF" />
          <FiGrid className="w-3.5 h-3.5 opacity-90" title="Excel" />
        </span>
      </button>

      <div className="absolute right-0 top-full pt-2 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Exportar inventario
            </p>
          </div>

          <div className="p-2 max-h-80 overflow-y-auto">
            <div className="mb-3">
              <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                <FiFileText className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                  Opciones PDF
                </span>
              </div>
              <div className="space-y-0.5">
                {renderOption(
                  "pdf",
                  "completa",
                  "Descargar PDF información completa",
                )}
                {tipos.map((tipo) =>
                  renderOption("pdf", tipo, `Descargar PDF ${tipo}`),
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2">
              <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                <FiGrid className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Opciones Excel
                </span>
              </div>
              <div className="space-y-0.5">
                {renderOption(
                  "excel",
                  "completa",
                  "Descargar Excel información completa",
                )}
                {tipos.map((tipo) =>
                  renderOption("excel", tipo, `Descargar Excel ${tipo}`),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
