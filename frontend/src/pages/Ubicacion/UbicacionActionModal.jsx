import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FiX, FiSave, FiTrash2, FiMapPin } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { ubicacionSchema } from "../../validators/ubicacionSchema";
import { useUbicaciones, ALA_OPCIONES } from "../../controllers/useUbicacion";

const inputClass = ({ hasError, isSuccess }) => `
  block w-full rounded-lg shadow-sm py-2 px-3 text-sm border transition-all duration-200 outline-none bg-white
  hover:border-gray-400
  disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
  ${
    hasError
      ? "border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-500"
      : isSuccess
        ? "border-green-400 focus:ring-2 focus:ring-green-200 focus:border-green-500"
        : "border-gray-300 focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
  }
`;

const resolverNombre = (lista, id, campoId) => {
  const item = lista.find((i) => String(i[campoId]) === String(id));
  return item?.nombre || "";
};

async function resolverIdsDesdeNombres(ubicacion) {
  const regionesRes = await axios.get(`/region`);
  const regionItem = regionesRes.data.find(
    (r) => r.nombre === ubicacion.region,
  );

  console.debug("resolverIdsDesdeNombres - ubicacion.region", ubicacion.region);
  console.debug("resolverIdsDesdeNombres - regionItem", regionItem);

  if (!regionItem) {
    return { region: "", estado: "", ciudad: "" };
  }

  const estadosRes = await axios.get(
    `/region/${regionItem.id_region}/estados`,
  );
  const estadoItem = estadosRes.data.find((e) => e.nombre === ubicacion.estado);

  if (!estadoItem) {
    return {
      region: String(regionItem.id_region),
      estado: "",
      ciudad: "",
    };
  }

  const ciudadesRes = await axios.get(
    `/estados/${estadoItem.id_estado}/ciudades`,
  );
  const ciudadItem = ciudadesRes.data.find(
    (c) => c.nombre === ubicacion.ciudad,
  );

  console.debug("resolverIdsDesdeNombres - estadoItem", estadoItem);
  console.debug("resolverIdsDesdeNombres - ciudadItem", ciudadItem);

  return {
    region: String(regionItem.id_region),
    estado: String(estadoItem.id_estado),
    ciudad: ciudadItem ? String(ciudadItem.id_ciudad) : "",
  };
}

function UbicacionFormFields({
  register,
  getFieldProps,
  regionActual,
  estadoActual,
  regionList,
  estadoList,
  ciudadesList,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-bold text-black mb-2">
          Región <span className="text-red-500">*</span>
        </label>
        <select
          {...register("region")}
          className={getFieldProps("region").className}
        >
          <option value="">-- Selecciona --</option>
          {regionList.map((r) => (
            <option key={r.id_region} value={r.id_region}>
              {r.nombre}
            </option>
          ))}
        </select>
        {getFieldProps("region").error && (
          <p className="text-xs text-red-600 mt-1">
            {getFieldProps("region").error}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-black mb-2">
          Estado <span className="text-red-500">*</span>
        </label>
        <select
          {...register("estado")}
          disabled={!regionActual}
          className={getFieldProps("estado").className}
        >
          <option value="">
            {regionActual
              ? "-- Selecciona --"
              : "-- Selecciona una región primero --"}
          </option>
          {estadoList.map((e) => (
            <option key={e.id_estado} value={e.id_estado}>
              {e.nombre}
            </option>
          ))}
        </select>
        {getFieldProps("estado").error && (
          <p className="text-xs text-red-600 mt-1">
            {getFieldProps("estado").error}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-black mb-2">
          Ciudad <span className="text-red-500">*</span>
        </label>
        <select
          {...register("ciudad")}
          disabled={!estadoActual}
          className={getFieldProps("ciudad").className}
        >
          <option value="">
            {estadoActual
              ? "-- Selecciona --"
              : "-- Selecciona un estado primero --"}
          </option>
          {ciudadesList.map((c) => (
            <option key={c.id_ciudad} value={c.id_ciudad}>
              {c.nombre}
            </option>
          ))}
        </select>
        {getFieldProps("ciudad").error && (
          <p className="text-xs text-red-600 mt-1">
            {getFieldProps("ciudad").error}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-black mb-2">
          Sede <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Ej: Torre 30"
          {...register("sede")}
          className={getFieldProps("sede").className}
        />
        {getFieldProps("sede").error && (
          <p className="text-xs text-red-600 mt-1">
            {getFieldProps("sede").error}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-black mb-2">
          Piso <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Ej: 3"
          {...register("piso", {
            onChange: (e) => {
              e.target.value = e.target.value.replace(/\D/g, "");
            },
          })}
          className={getFieldProps("piso").className}
        />
        {getFieldProps("piso").error && (
          <p className="text-xs text-red-600 mt-1">
            {getFieldProps("piso").error}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-black mb-2">Ala</label>
        <select {...register("ala")} className={getFieldProps("ala").className}>
          <option value="">-- Sin ala --</option>
          {ALA_OPCIONES.map((ala) => (
            <option key={ala} value={ala}>
              {ala}
            </option>
          ))}
        </select>
        {getFieldProps("ala").error && (
          <p className="text-xs text-red-600 mt-1">
            {getFieldProps("ala").error}
          </p>
        )}
      </div>
    </div>
  );
}

export default function UbicacionActionModal({
  isOpen,
  onClose,
  ubicacion,
  type,
  onUbicacionActualizada,
}) {
  const prevRegion = useRef(null);
  const prevEstado = useRef(null);
  const [valoresPendientes, setValoresPendientes] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getFieldState,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ubicacionSchema),
    mode: "onChange",
    defaultValues: {
      region: "",
      estado: "",
      ciudad: "",
      sede: "",
      piso: "",
      ala: "",
    },
  });

  const regionActual = watch("region");
  const estadoActual = watch("estado");

  const { regionList, estadoList, ciudadesList } = useUbicaciones({
    regionActual,
    estadoActual,
  });

  useEffect(() => {
    if (!isOpen) {
      prevRegion.current = null;
      prevEstado.current = null;
      return;
    }

    if (type === "edit" && ubicacion) {
      const cargarFormulario = async () => {
        try {
          const respuesta = await axios.get(
            `/ubicaciones/${ubicacion.id}`,
          );
          const ubiCompleta = respuesta.data;

          const ids = await resolverIdsDesdeNombres(ubiCompleta);

          console.debug("cargarFormulario - ids resueltos:", ids);
          console.debug("cargarFormulario - ubiCompleta:", ubiCompleta);

          prevRegion.current = ids.region;
          prevEstado.current = ids.estado;

          reset({
            region: ids.region,
            estado: ids.estado,
            ciudad: ids.ciudad,
            sede: ubiCompleta.sede || "",
            piso: String(ubiCompleta.piso || ""),
            ala: ubiCompleta.ala || "",
          });

          setValoresPendientes({
            region: ids.region,
            estado: ids.estado,
            ciudad: ids.ciudad,
          });
          console.log(prevRegion);
        } catch (error) {
          console.error("Error al cargar datos de edición:", error);
          toast.error("No se pudieron cargar los datos de la ubicación.");
        }
      };

      cargarFormulario();
    }
  }, [isOpen, type, ubicacion, reset]);

  useEffect(() => {
    if (prevRegion.current !== null && prevRegion.current !== regionActual) {
      setValue("estado", "");
      setValue("ciudad", "");
      prevEstado.current = null;
    }
    prevRegion.current = regionActual;
  }, [regionActual, setValue]);

  useEffect(() => {
    if (prevEstado.current !== null && prevEstado.current !== estadoActual) {
      setValue("ciudad", "");
    }
    prevEstado.current = estadoActual;
  }, [estadoActual, setValue]);

  // Aplica valores pendientes (provenientes del payload del servidor)
  // cuando las listas dependientes (estadoList / ciudadesList) ya están cargadas.
  useEffect(() => {
    if (!valoresPendientes) return;

    console.debug("aplicarValoresPendientes - pendientes:", valoresPendientes);
    console.debug("aplicarValoresPendientes - listas lengths:", {
      regionList: regionList.length,
      estadoList: estadoList.length,
      ciudadesList: ciudadesList.length,
    });

    // Aplicar en orden: region -> estado -> ciudad
    // 1) Si tenemos región pendiente y las regiones ya llegaron, setValue region.
    if (valoresPendientes.region && regionList.length > 0) {
      setValue("region", valoresPendientes.region);
      // after setting region, dependencias (estadoList) se cargarán automáticamente
    }

    // 2) Si tenemos estado pendiente y la lista de estados ya llegó, setValue estado.
    if (valoresPendientes.estado && estadoList.length > 0) {
      setValue("estado", valoresPendientes.estado);
    }

    // 3) Si tenemos ciudad pendiente y la lista de ciudades ya llegó, setValue ciudad.
    if (valoresPendientes.ciudad && ciudadesList.length > 0) {
      setValue("ciudad", valoresPendientes.ciudad);
    }

    // Limpiar pendientes sólo cuando las opciones relevantes estén disponibles
    const canClear =
      (!valoresPendientes.region || regionList.length > 0) &&
      (!valoresPendientes.estado || estadoList.length > 0) &&
      (!valoresPendientes.ciudad || ciudadesList.length > 0);

    if (canClear) setValoresPendientes(null);
  }, [valoresPendientes, regionList, estadoList, ciudadesList, setValue]);

  const getFieldProps = (name) => {
    const state = getFieldState(name);
    return {
      className: inputClass({
        hasError: state.invalid,
        isSuccess: state.isDirty && !state.invalid,
      }),
      error: state.invalid ? errors[name]?.message : null,
    };
  };

  const onSubmitEdit = async (data) => {
    // 1. Corrección de los nombres de los campos (campoId)
    const payload = {
      region: resolverNombre(regionList, data.region, "id_region"),
      estado: resolverNombre(estadoList, data.estado, "id_estado"),
      ciudad: resolverNombre(ciudadesList, data.ciudad, "id_ciudad"),
      sede: data.sede.trim(),
      piso: data.piso.trim(),
      ala: data.ala || null,
    };

    // 2. Si alguna resolución falla, se detiene
    if (!payload.region || !payload.estado || !payload.ciudad) {
      toast.error("Selecciona región, estado y ciudad válidos.");
      return;
    }

    // 3. Envío de datos por Axios
    const peticion = axios.put(
      `/ubicaciones/${ubicacion.id}`,
      payload,
      { withCredentials: true },
    );

    toast.promise(peticion, {
      loading: "Guardando cambios...",
      success: (response) => {
        onUbicacionActualizada?.();
        onClose();
        return response.data.message || "Ubicación actualizada con éxito";
      },
      error: (error) =>
        error.response?.data?.message || "Error al actualizar la ubicación",
    });
  };
  const handleDelete = async () => {
    const peticion = axios.put(
      `/ubicaciones/eliminadas/${ubicacion.id}`,
      {}, // Segundo argumento: Cuerpo de la petición vacío
      { withCredentials: true }, // Tercer argumento: Configuración correcta de Axios
    );

    toast.promise(peticion, {
      loading: "Eliminando ubicación...",
      success: (response) => {
        onUbicacionActualizada?.();
        onClose();
        return response.data.message || "Ubicación eliminada con éxito";
      },
      error: (error) =>
        error.response?.data?.message || "Error al eliminar la ubicación",
    });
  };

  if (!isOpen || !ubicacion) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[95vh] overflow-y-auto">
        <div className="bg-primary-900 px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {type === "view" && "Detalles de la Ubicación"}
              {type === "edit" && "Editar Ubicación"}
              {type === "delete" && "Eliminar Ubicación"}
            </h2>
            <p className="text-primary-100 text-sm mt-1">
              {type === "view" &&
                "Visualiza toda la información de la ubicación seleccionada."}
              {type === "edit" &&
                "Actualiza los datos de la ubicación seleccionada."}
              {type === "delete" &&
                "Esta acción eliminará la ubicación del sistema."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded-xl p-2 transition-all"
            aria-label="Cerrar"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {type === "view" && (
          <div className="p-8">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <FiMapPin className="text-primary-600 w-5 h-5" />
                <h3 className="font-bold text-gray-800">
                  Información de Ubicación
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <p>
                  <span className="font-bold text-gray-700">Región:</span>{" "}
                  <span className="text-gray-900">
                    {ubicacion.region || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="font-bold text-gray-700">Estado:</span>{" "}
                  <span className="text-gray-900">
                    {ubicacion.estado || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="font-bold text-gray-700">Ciudad:</span>{" "}
                  <span className="text-gray-900">
                    {ubicacion.ciudad || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="font-bold text-gray-700">Sede:</span>{" "}
                  <span className="text-gray-900">
                    {ubicacion.sede || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="font-bold text-gray-700">Piso:</span>{" "}
                  <span className="text-gray-900">
                    {ubicacion.piso || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="font-bold text-gray-700">Ala:</span>{" "}
                  <span className="text-gray-900">{ubicacion.ala || "—"}</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-100 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {type === "edit" && (
          <form onSubmit={handleSubmit(onSubmitEdit)} className="p-8">
            <UbicacionFormFields
              register={register}
              getFieldProps={getFieldProps}
              regionActual={regionActual}
              estadoActual={estadoActual}
              regionList={regionList}
              estadoList={estadoList}
              ciudadesList={ciudadesList}
            />

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-100 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <FiSave />
                Guardar Cambios
              </button>
            </div>
          </form>
        )}

        {type === "delete" && (
          <div className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-5 rounded-full mb-5">
                <FiTrash2 className="w-10 h-10 text-red-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                ¿Eliminar Ubicación?
              </h3>

              <p className="text-gray-600 max-w-md">
                ¿Estás seguro de que deseas eliminar la ubicación{" "}
                <strong>{ubicacion.sede}</strong>?
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <FiTrash2 />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
