export const buildPayload = (formData) => {
  const tipoDispositivo = formData.type.toUpperCase();

  // Estructura Base para TODOS los equipos (PC, Laptop o Periféricos)
  const payload = {
    marca: formData.name.trim(),
    modelo: formData.model.trim(),
    serial: formData.serial,
    estado: formData.status,
    notas: formData.description || "",
    procedencia: {
      region: formData.regionP,
      estado: formData.estadoP,
      ciudad: formData.cityP,
      sede: formData.sedeP,
      piso: formData.pisoP,
      ala: formData.alaP || null,
    },
    asignacion: {
      region: formData.region,
      estado: formData.estado,
      ciudad: formData.city,
      sede: formData.sede,
      piso: formData.piso,
      ala: formData.ala || null,
    },
  };

  // Si es CPU o LAPTOP, agregamos Componentes y Periféricos vinculados
  if (tipoDispositivo === "PC" || tipoDispositivo === "LAPTOP") {
    payload.componentes = [];
    payload.perifericos = [];

    // Mapear múltiples RAMs
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
        tipo: "Monitor",
        serial: formData.monitorSerial,
        modelo: formData.monitorBrand,
        estado: formData.monitorStatus,
      });
    }
    if (formData.hasKeyboard && formData.keyboardSerial) {
      payload.perifericos.push({
        tipo: "Teclado",
        serial: formData.keyboardSerial,
        modelo: formData.keyboardBrand,
        estado: formData.keyboardStatus,
      });
    }
    if (formData.hasMouse && formData.mouseSerial) {
      payload.perifericos.push({
        tipo: "Mouse",
        serial: formData.mouseSerial,
        modelo: formData.mouseBrand,
        estado: formData.mouseStatus,
      });
    }
    if (formData.hasSpeakers && formData.speakersSerial) {
      payload.perifericos.push({
        tipo: "Corneta",
        serial: formData.speakersSerial,
        modelo: formData.speakersBrand,
        estado: formData.speakersStatus,
      });
    }
  }

  return payload;
};
