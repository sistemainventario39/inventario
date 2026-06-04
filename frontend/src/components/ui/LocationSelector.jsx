import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function LocationSelector({
  setFormData,
  typePrefix,
  formData,
}) {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const obtenerUbicaciones = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/ubicaciones",
        );
        setUbicaciones(response.data);
      } catch (error) {
        console.error("Error obteniendo ubicaciones:", error);
      }
    };
    obtenerUbicaciones();
  }, []);
  useEffect(() => {
    if (!ubicaciones.length) return;

    const pfx = typePrefix || "";

    const sedeId = formData?.[`sede${pfx}`];
    const pisoId = formData?.[`piso${pfx}`];

    if (!sedeId) return;

    const ubicacionEncontrada = ubicaciones.find(
      (u) =>
        String(u.id_sede) === String(sedeId) &&
        String(u.id_piso) === String(pisoId),
    );

    if (!ubicacionEncontrada) return;

    const tieneAla =
      ubicacionEncontrada.alas && ubicacionEncontrada.alas !== "NULL";

    const textoAla = tieneAla ? `, Ala: ${ubicacionEncontrada.alas}` : "";

    setBusqueda(
      `${ubicacionEncontrada.sede} (${ubicacionEncontrada.ciudad}, Piso: ${ubicacionEncontrada.piso}${textoAla})`,
    );
  }, [ubicaciones, formData, typePrefix]);
  // Cerrar el dropdown si el usuario hace clic fuera de él
  useEffect(() => {
    const handleClickFuera = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  // Filtrar las ubicaciones en base a lo que escriba el usuario (busca por Sede o Ciudad)
  const ubicacionesFiltradas = ubicaciones.filter((item) => {
    const termino = busqueda.toLowerCase();
    return (
      item.sede.toLowerCase().includes(termino) ||
      item.ciudad.toLowerCase().includes(termino)
    );
  });

  // Al seleccionar una opción, guardamos TODOS los IDs y campos en el formData
  const manejarSeleccion = (ubi) => {
    const pfx = typePrefix || "";

    // Validamos que el ala exista y no sea un string "NULL" de la base de datos
    const tieneAla = ubi.alas && ubi.alas !== "NULL" && ubi.alas !== null;
    const textoAla = tieneAla ? `, Ala: ${ubi.alas}` : "";

    setFormData((prev) => ({
      ...prev,
      [`region${pfx}`]: ubi.id_region,
      [`estado${pfx}`]: ubi.id_estado,
      [`city${pfx}`]: ubi.id_ciudad,
      [`sede${pfx}`]: ubi.id_sede,
      [`piso${pfx}`]: ubi.id_piso,
      // Guardamos el string del ala o vacío si no aplica
      [`ala${pfx}`]: tieneAla ? ubi.alas : "",
    }));

    // Formateamos el texto que se verá reflejado en el input
    setBusqueda(`${ubi.sede} (${ubi.ciudad}, Piso: ${ubi.piso}${textoAla})`);
    setMostrarDropdown(false);
  };
  const limpiarUbicacion = () => {
    setBusqueda("");

    const pfx = typePrefix || "";

    setFormData((prev) => ({
      ...prev,
      [`region${pfx}`]: "",
      [`estado${pfx}`]: "",
      [`city${pfx}`]: "",
      [`sede${pfx}`]: "",
      [`piso${pfx}`]: "",
      [`ala${pfx}`]: "",
    }));
  };

  return (
    <div className="w-full bg-blue-50/40 p-4 rounded-xl border border-blue-100 flex flex-col gap-4">
      {/* Cabecera con botones por defecto */}

      {/* Input Buscador / Autocomplete */}
      <div className="relative w-full" ref={dropdownRef}>
        <label className="block text-sm font-bold text-black mb-2">
          Ubicación <span className="text-red-500">*</span>
        </label>

        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 pr-10 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800 shadow-sm"
            placeholder="Buscar por Sede o Ciudad..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setMostrarDropdown(true);
            }}
            onFocus={() => setMostrarDropdown(true)}
            onKeyDown={(e) => {
              if (
                (e.key === "Backspace" || e.key === "Delete") &&
                busqueda.length > 0
              ) {
                limpiarUbicacion();
              }
            }}
          />
          {/* Icono de flecha */}
          <div className="absolute right-3 pointer-events-none text-gray-500">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Dropdown de opciones filtradas */}
        {mostrarDropdown && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-100">
            {ubicacionesFiltradas.length > 0 ? (
              ubicacionesFiltradas.map((ubi, index) => {
                // Validación exacta de la nueva columna plural 'alas' de tu BD
                const tieneAla =
                  ubi.alas && ubi.alas !== "NULL" && ubi.alas !== null;
                const textoAla = tieneAla ? `, Ala: ${ubi.alas}` : "";

                return (
                  <li
                    key={index}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 transition-colors"
                    onClick={() => manejarSeleccion(ubi)}
                  >
                    <span className="font-bold text-blue-900">{ubi.sede}</span>{" "}
                    <span className="text-gray-500">
                      ({ubi.ciudad}, Piso: {ubi.piso}
                      {textoAla})
                    </span>
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-3 text-sm text-gray-500 italic">
                No se encontraron ubicaciones
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
