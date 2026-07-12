//esta función es para la bitacora, para que a la hora de cambiar almacene temporalmente la información anterior y le indique al sistema que es lo que se modifico y que es lo nuevo.
export function generarCambios(oldData, newData) {
  const cambios = [];
  // Campos a monitorear
  const campos = ["telefono", "rol", "nombre", "apellido", "correo"];

  campos.forEach((campo) => {
    if (oldData[campo] !== newData[campo] && newData[campo] !== undefined) {
      cambios.push(
        `${campo.charAt(0).toUpperCase() + campo.slice(1)} modificado: Antes [${oldData[campo]}] Ahora [${newData[campo]}]`,
      );
    }
  });

  // Caso especial: Ubicación
  if (JSON.stringify(oldData.ubicacion) !== JSON.stringify(newData.ubicacion)) {
    cambios.push("Ubicación modificada");
  }

  // Caso especial: Password
  if (newData.password && newData.password !== oldData.password) {
    cambios.push("Cambio de clave realizado");
  }

  return cambios;
}

// src/utils/inventory.helpers.js (o donde manejes tus funciones de bitácora)

export function generarCambiosUbicacion(oldData, newData) {
  const cambios = [];
  const campos = ["region", "estado", "ciudad", "sede", "piso", "ala"];

  campos.forEach((campo) => {
    // Normalizamos valores nulos o indefinidos a "N/A" para evitar falsos positivos en la comparación
    const antes =
      oldData[campo] !== undefined && oldData[campo] !== null
        ? oldData[campo]
        : "N/A";
    const despues =
      newData[campo] !== undefined && newData[campo] !== null
        ? newData[campo]
        : "N/A";

    if (antes !== despues) {
      cambios.push(
        `${campo.charAt(0).toUpperCase() + campo.slice(1)} modificado: Antes [${antes}] Ahora [${despues}]`,
      );
    }
  });

  return cambios;
}

export function generarCambiosEquipo(current, updatedData) {
  const cambios = [];

  // 1. Monitoreo de campos básicos del equipo
  const camposCore = ["serial", "marca", "modelo", "estado"];
  camposCore.forEach((campo) => {
    const antes = current[campo] || "N/A";
    const despues = updatedData[campo] || "N/A";
    if (antes !== despues && updatedData[campo] !== undefined) {
      cambios.push(
        `${campo.charAt(0).toUpperCase() + campo.slice(1)} modificado: Antes [${antes}] Ahora [${despues}]`,
      );
    }
  });

  // 2. Monitoreo de Ubicación de Asignación
  const oldAsig = current.asignacion || {};
  const newAsig = updatedData.asignacion || {};
  if (
    oldAsig.sede !== newAsig.sede ||
    oldAsig.piso !== newAsig.piso ||
    oldAsig.alas !== newAsig.alas
  ) {
    cambios.push(
      `Ubicación modificada: Antes [Sede: ${oldAsig.sede || "N/A"}, Piso: ${oldAsig.piso || "N/A"}] -> Ahora [Sede: ${newAsig.sede || "N/A"}, Piso: ${newAsig.piso || "N/A"}]`,
    );
  }

  // 3. Monitoreo Analítico de Componentes de Hardware (RAM, CPU, Almacenamiento)
  const extraerEspecificaciones = (componentes) => {
    const rams =
      componentes
        .filter((c) => c.tipo?.toLowerCase().includes("ram"))
        .map((r) => r.capacidad || "RAM")
        .join(" + ") || "N/A";
    const cpus =
      componentes
        .filter(
          (c) =>
            c.tipo?.toLowerCase().includes("procesador") ||
            c.tipo?.toLowerCase() === "cpu",
        )
        .map((c) => c.modelo || "CPU")
        .join(" / ") || "N/A";
    const discos =
      componentes
        .filter(
          (c) =>
            c.tipo?.toLowerCase().includes("disco") ||
            c.tipo?.toLowerCase().includes("almacenamiento"),
        )
        .map((d) => d.capacidad || "Disco")
        .join(" + ") || "N/A";
    return { rams, cpus, discos };
  };

  const especificacionesViejas = extraerEspecificaciones(
    current.componentes || [],
  );
  const especificacionesNuevas = extraerEspecificaciones(
    updatedData.componentes || [],
  );

  if (especificacionesViejas.rams !== especificacionesNuevas.rams) {
    cambios.push(
      `Memoria RAM modificada: Antes [${especificacionesViejas.rams}] Ahora [${especificacionesNuevas.rams}]`,
    );
  }
  if (especificacionesViejas.cpus !== especificacionesNuevas.cpus) {
    cambios.push(
      `Procesador modificado: Antes [${especificacionesViejas.cpus}] Ahora [${especificacionesNuevas.cpus}]`,
    );
  }
  if (especificacionesViejas.discos !== especificacionesNuevas.discos) {
    cambios.push(
      `Almacenamiento modificado: Antes [${especificacionesViejas.discos}] Ahora [${especificacionesNuevas.discos}]`,
    );
  }

  // 4. Monitoreo de Flujo de Periféricos (Pasados desde el mapeo interno de la ruta)
  if (updatedData.perifericosAnadidos?.length > 0) {
    cambios.push(
      `Periféricos conectados al equipo: [${updatedData.perifericosAnadidos.join(", ")}]`,
    );
  }
  if (updatedData.perifericosRemovidos?.length > 0) {
    cambios.push(
      `Periféricos desvinculados del equipo: [${updatedData.perifericosRemovidos.join(", ")}]`,
    );
  }

  return cambios;
}
