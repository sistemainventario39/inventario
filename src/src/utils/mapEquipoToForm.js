import { defaultFormData } from "./defaultFormData";

export const mapEquipoToForm = (equipoFromAPI) => {
  // Inicializamos con los datos por defecto para asegurar que no falten propiedades
  const mappedData = { ...defaultFormData };

  // Datos base
  mappedData.name = equipoFromAPI.marca || "";
  mappedData.model = equipoFromAPI.modelo || "";
  mappedData.serial = equipoFromAPI.serial || "";
  mappedData.type = equipoFromAPI.tipo || equipoFromAPI.tipoDispositivo || ""; // Asegúrate de pasar el tipo desde la API o la vista
  mappedData.status = equipoFromAPI.estado || "Bueno";
  mappedData.description = equipoFromAPI.notas || "";
  // Relación con estación de trabajo
  mappedData.assigned = equipoFromAPI.asignado || false;
  mappedData.equipoId = equipoFromAPI.equipoId || "";
  mappedData.equipoSerial = equipoFromAPI.equipoSerial || "";

  if (equipoFromAPI.equipoRelacionado) {
    mappedData.equipoRelacionado = equipoFromAPI.equipoRelacionado;

    mappedData.selectedEquipo = {
      value: equipoFromAPI.equipoRelacionado.id,
      label: `${equipoFromAPI.equipoRelacionado.serial} - ${equipoFromAPI.equipoRelacionado.marca} ${equipoFromAPI.equipoRelacionado.modelo}`,
    };
  }

  if (equipoFromAPI.fechaIncorporacion) {
    mappedData.acquisitionDate = new Date(equipoFromAPI.fechaIncorporacion);
  }

  // Procedencia
  if (equipoFromAPI.procedencia) {
    mappedData.regionP = equipoFromAPI.procedencia.region || "";
    mappedData.estadoP = equipoFromAPI.procedencia.estado || "";
    mappedData.cityP = equipoFromAPI.procedencia.ciudad || "";
    mappedData.sedeP = equipoFromAPI.procedencia.sede || "";
    mappedData.pisoP = equipoFromAPI.procedencia.piso || "";
    mappedData.alaP = equipoFromAPI.procedencia.ala || "";
  }

  // Asignación
  if (equipoFromAPI.asignacion) {
    mappedData.region = equipoFromAPI.asignacion.region || "";
    mappedData.estado = equipoFromAPI.asignacion.estado || "";
    mappedData.city = equipoFromAPI.asignacion.ciudad || "";
    mappedData.sede = equipoFromAPI.asignacion.sede || "";
    mappedData.piso = equipoFromAPI.asignacion.piso || "";
    mappedData.ala = equipoFromAPI.asignacion.ala || "";
  }

  // Si tiene componentes (CPU, Laptop)
  if (equipoFromAPI.componentes && Array.isArray(equipoFromAPI.componentes)) {
    const rams = [];
    const storages = [];

    equipoFromAPI.componentes.forEach((comp) => {
      if (comp.tipo === "Memoria_RAM") {
        rams.push({
          capacity: comp.capacidad,
          status: comp.estado || "Bueno",
          serial: comp.serial,
        });
      } else if (comp.tipo === "Disco_Duro") {
        storages.push({
          capacity: comp.capacidad,
          status: comp.estado || "Bueno",
          serial: comp.serial,
        });
      } else if (comp.tipo === "Procesador") {
        mappedData.processor = comp.modelo || "";
        mappedData.processorStatus = comp.estado || "Bueno";
      }
    });

    if (rams.length > 0) mappedData.ramList = rams;
    if (storages.length > 0) mappedData.storageList = storages;
  }

  // Si tiene periféricos (CPU, Laptop)
  if (equipoFromAPI.perifericos && Array.isArray(equipoFromAPI.perifericos)) {
    equipoFromAPI.perifericos.forEach((perif) => {
      const tipo = perif.tipo.toLowerCase();
      if (tipo === "monitor") {
        mappedData.hasMonitor = true;
        mappedData.monitorSerial = perif.serial || "";
        mappedData.monitorBrand = perif.modelo || "";
        mappedData.monitorStatus = perif.estado || "Bueno";
      } else if (tipo === "teclado") {
        mappedData.hasKeyboard = true;
        mappedData.keyboardSerial = perif.serial || "";
        mappedData.keyboardBrand = perif.modelo || "";
        mappedData.keyboardStatus = perif.estado || "Bueno";
      } else if (tipo === "mouse") {
        mappedData.hasMouse = true;
        mappedData.mouseSerial = perif.serial || "";
        mappedData.mouseBrand = perif.modelo || "";
        mappedData.mouseStatus = perif.estado || "Bueno";
      } else if (tipo === "corneta") {
        mappedData.hasSpeakers = true;
        mappedData.speakersSerial = perif.serial || "";
        mappedData.speakersBrand = perif.modelo || "";
        mappedData.speakersStatus = perif.estado || "Bueno";
      }
    });
  }
  console.log("MAP RESULT:", mappedData);
  return mappedData;
};
