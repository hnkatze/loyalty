import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config";
import { updateClientBalance } from "./clients";
import { createTransaction } from "./transactions";
import type { Redemption, RedemptionStatus } from "@/types";

const COLLECTION = "redemptions";

const checkDb = () => {
  if (!db) {
    throw new Error(
      "Firebase no está configurado. Verifica las variables de entorno."
    );
  }
  return db;
};

/**
 * Genera un código de canje único (CJ-XXXXXX)
 */
function generateRedemptionCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "CJ-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Crea un nuevo canje pendiente
 * Descuenta los puntos inmediatamente (se devuelven si se cancela)
 */
export const createRedemption = async (data: {
  establishmentId: string;
  clientId: string;
  clientName: string;
  currentBalance: number;
  rewardId: string;
  rewardName: string;
  rewardCost: number;
}): Promise<{ success: boolean; code?: string; redemptionId?: string; error?: string }> => {
  const firestore = checkDb();

  // Verificar que el cliente tiene suficientes puntos
  if (data.currentBalance < data.rewardCost) {
    return { success: false, error: "No tienes suficientes puntos" };
  }

  try {
    // Generar código único
    let code = generateRedemptionCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await getRedemptionByCode(data.establishmentId, code);
      if (!existing) break;
      code = generateRedemptionCode();
      attempts++;
    }

    // Calcular fecha de expiración (24 horas)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Descontar puntos inmediatamente
    const newBalance = data.currentBalance - data.rewardCost;
    await updateClientBalance(data.clientId, newBalance);

    // Crear el documento de canje
    const docRef = await addDoc(collection(firestore, COLLECTION), {
      code,
      establishmentId: data.establishmentId,
      clientId: data.clientId,
      clientName: data.clientName,
      rewardId: data.rewardId,
      rewardName: data.rewardName,
      rewardCost: data.rewardCost,
      status: "pending" as RedemptionStatus,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });

    return { success: true, code, redemptionId: docRef.id };
  } catch (error) {
    console.error("Error creating redemption:", error);
    return { success: false, error: "Error al crear el canje" };
  }
};

/**
 * Busca un canje por su código
 */
export const getRedemptionByCode = async (
  establishmentId: string,
  code: string
): Promise<Redemption | null> => {
  const firestore = checkDb();

  // Normalizar código (remover guión si lo tiene y convertir a mayúsculas)
  const normalizedCode = code.toUpperCase().trim();

  const q = query(
    collection(firestore, COLLECTION),
    where("establishmentId", "==", establishmentId),
    where("code", "==", normalizedCode)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;

  const docSnap = querySnapshot.docs[0];
  const data = docSnap.data();

  return {
    id: docSnap.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    expiresAt: (data.expiresAt as Timestamp)?.toDate() || new Date(),
    confirmedAt: data.confirmedAt ? (data.confirmedAt as Timestamp).toDate() : undefined,
    cancelledAt: data.cancelledAt ? (data.cancelledAt as Timestamp).toDate() : undefined,
  } as Redemption;
};

/**
 * Obtiene un canje por ID
 */
export const getRedemption = async (redemptionId: string): Promise<Redemption | null> => {
  const firestore = checkDb();
  const docRef = doc(firestore, COLLECTION, redemptionId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    expiresAt: (data.expiresAt as Timestamp)?.toDate() || new Date(),
    confirmedAt: data.confirmedAt ? (data.confirmedAt as Timestamp).toDate() : undefined,
    cancelledAt: data.cancelledAt ? (data.cancelledAt as Timestamp).toDate() : undefined,
  } as Redemption;
};

/**
 * Confirma un canje (owner lo marca como entregado)
 * Crea la transacción de tipo "redeemed"
 */
export const confirmRedemption = async (
  redemptionId: string,
  confirmedBy: string
): Promise<{ success: boolean; error?: string }> => {
  const firestore = checkDb();

  try {
    const redemption = await getRedemption(redemptionId);

    if (!redemption) {
      return { success: false, error: "Canje no encontrado" };
    }

    if (redemption.status !== "pending") {
      return { success: false, error: `Este canje ya está ${redemption.status === "confirmed" ? "confirmado" : redemption.status === "expired" ? "expirado" : "cancelado"}` };
    }

    // Verificar que no haya expirado
    if (new Date() > redemption.expiresAt) {
      // Marcar como expirado
      await updateDoc(doc(firestore, COLLECTION, redemptionId), {
        status: "expired" as RedemptionStatus,
      });
      return { success: false, error: "Este canje ha expirado" };
    }

    // Actualizar estado a confirmado
    await updateDoc(doc(firestore, COLLECTION, redemptionId), {
      status: "confirmed" as RedemptionStatus,
      confirmedAt: serverTimestamp(),
      confirmedBy,
    });

    // Crear transacción de tipo "redeemed" (los puntos ya fueron descontados al crear)
    await createTransaction({
      establishmentId: redemption.establishmentId,
      clientId: redemption.clientId,
      type: "redeemed",
      amount: redemption.rewardCost,
      rewardId: redemption.rewardId,
      notes: `Canje confirmado: ${redemption.rewardName}`,
      createdBy: confirmedBy,
    });

    return { success: true };
  } catch (error) {
    console.error("Error confirming redemption:", error);
    return { success: false, error: "Error al confirmar el canje" };
  }
};

/**
 * Cancela un canje y devuelve los puntos al cliente
 */
export const cancelRedemption = async (
  redemptionId: string,
  clientCurrentBalance: number
): Promise<{ success: boolean; error?: string }> => {
  const firestore = checkDb();

  try {
    const redemption = await getRedemption(redemptionId);

    if (!redemption) {
      return { success: false, error: "Canje no encontrado" };
    }

    if (redemption.status !== "pending") {
      return { success: false, error: "Solo se pueden cancelar canjes pendientes" };
    }

    // Devolver puntos al cliente
    const newBalance = clientCurrentBalance + redemption.rewardCost;
    await updateClientBalance(redemption.clientId, newBalance);

    // Actualizar estado a cancelado
    await updateDoc(doc(firestore, COLLECTION, redemptionId), {
      status: "cancelled" as RedemptionStatus,
      cancelledAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error cancelling redemption:", error);
    return { success: false, error: "Error al cancelar el canje" };
  }
};

/**
 * Obtiene los canjes pendientes de un cliente
 */
export const getPendingRedemptionsByClient = async (
  clientId: string
): Promise<Redemption[]> => {
  const firestore = checkDb();

  const q = query(
    collection(firestore, COLLECTION),
    where("clientId", "==", clientId),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      expiresAt: (data.expiresAt as Timestamp)?.toDate() || new Date(),
    } as Redemption;
  });
};

/**
 * Obtiene los canjes pendientes de un establecimiento
 */
export const getPendingRedemptionsByEstablishment = async (
  establishmentId: string
): Promise<Redemption[]> => {
  const firestore = checkDb();

  const q = query(
    collection(firestore, COLLECTION),
    where("establishmentId", "==", establishmentId),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      expiresAt: (data.expiresAt as Timestamp)?.toDate() || new Date(),
    } as Redemption;
  });
};

/**
 * Obtiene el historial de canjes de un cliente
 */
export const getRedemptionsByClient = async (
  clientId: string
): Promise<Redemption[]> => {
  const firestore = checkDb();

  const q = query(
    collection(firestore, COLLECTION),
    where("clientId", "==", clientId),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      expiresAt: (data.expiresAt as Timestamp)?.toDate() || new Date(),
      confirmedAt: data.confirmedAt ? (data.confirmedAt as Timestamp).toDate() : undefined,
      cancelledAt: data.cancelledAt ? (data.cancelledAt as Timestamp).toDate() : undefined,
    } as Redemption;
  });
};
