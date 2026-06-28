import {
  serialIndexId,
  normalizeLocationInput,
  locationIdFromData,
} from "../utils/inventory.validators.js";

export async function getOrCreateUbicacion(tx, input, label) {
  const data = normalizeLocationInput(input, label);
  const id = locationIdFromData(data);
  const ref = db.collection(COL.ubicaciones).doc(id);
  const snap = await tx.get(ref);

  if (!snap.exists) {
    tx.set(ref, {
      ...data,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  return { id, ...data };
}

export async function reserveIndex(
  tx,
  { prefix, serial, equipoId, equipoSerial, tipoEquipo, itemType },
) {
  const id = serialIndexId(prefix, serial);
  const ref = db.collection(COL.indices).doc(id);
  const snap = await tx.get(ref);

  if (snap.exists) {
    const current = snap.data();
    if (current.equipoId && current.equipoId !== equipoId) {
      throw badRequest(
        `El serial "${serial}" ya está registrado en otro equipo.`,
      );
    }
    tx.set(
      ref,
      {
        prefix,
        serial,
        serialNorm: normalize(serial),
        equipoId,
        equipoSerial,
        tipoEquipo,
        itemType,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return id;
  }

  tx.set(ref, {
    prefix,
    serial,
    serialNorm: normalize(serial),
    equipoId,
    equipoSerial,
    tipoEquipo,
    itemType,
    createdAt: FieldValue.serverTimestamp(),
  });

  return id;
}

export async function releaseIndex(tx, { prefix, serial }) {
  const id = serialIndexId(prefix, serial);
  const ref = db.collection(COL.indices).doc(id);
  const snap = await tx.get(ref);

  if (snap.exists) {
    tx.delete(ref);
  }
}

export async function validateUniqueSerial(tx, serial, tipo) {
  const indexId = serialIndexId(tipo, serial);
  const ref = db.collection(COL.indices).doc(indexId);
  const snap = await tx.get(ref);

  if (snap.exists) {
    throw badRequest(`El serial "${serial}" ya se encuentra registrado.`);
  }
}
