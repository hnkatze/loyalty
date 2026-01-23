import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../config";
import type { Reward } from "@/types";

const COLLECTION = "rewards";

const checkDb = () => {
  if (!db) {
    throw new Error("Firebase no está configurado. Verifica las variables de entorno.");
  }
  return db;
};

// Crear recompensa
export const createReward = async (data: {
  establishmentId: string;
  name: string;
  description?: string;
  cost: number;
  imageURL?: string;
}): Promise<string> => {
  const firestore = checkDb();
  const docRef = await addDoc(collection(firestore, COLLECTION), {
    ...data,
    isActive: true,
    redemptionCount: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Obtener recompensa por ID
export const getReward = async (rewardId: string): Promise<Reward | null> => {
  const firestore = checkDb();
  const docRef = doc(firestore, COLLECTION, rewardId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
  } as Reward;
};

// Obtener recompensas por establecimiento
export const getRewardsByEstablishment = async (
  establishmentId: string
): Promise<Reward[]> => {
  const firestore = checkDb();
  const q = query(
    collection(firestore, COLLECTION),
    where("establishmentId", "==", establishmentId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Reward;
  });
};

// Obtener solo recompensas activas
export const getActiveRewards = async (
  establishmentId: string
): Promise<Reward[]> => {
  const firestore = checkDb();
  const q = query(
    collection(firestore, COLLECTION),
    where("establishmentId", "==", establishmentId),
    where("isActive", "==", true),
    orderBy("cost", "asc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Reward;
  });
};

// Actualizar recompensa
export const updateReward = async (
  rewardId: string,
  data: Partial<Omit<Reward, "id" | "createdAt" | "establishmentId">>
): Promise<void> => {
  const firestore = checkDb();
  const docRef = doc(firestore, COLLECTION, rewardId);
  await updateDoc(docRef, data);
};

// Eliminar recompensa
export const deleteReward = async (rewardId: string): Promise<void> => {
  const firestore = checkDb();
  const docRef = doc(firestore, COLLECTION, rewardId);
  await deleteDoc(docRef);
};

// Incrementar contador de canjes
export const incrementRedemptionCount = async (
  rewardId: string
): Promise<void> => {
  const firestore = checkDb();
  const docRef = doc(firestore, COLLECTION, rewardId);
  await updateDoc(docRef, {
    redemptionCount: increment(1),
  });
};

// Canjear recompensa (proceso completo)
export const redeemReward = async (data: {
  rewardId: string;
  clientId: string;
  establishmentId: string;
  createdBy: string;
}): Promise<{ success: boolean; error?: string }> => {
  // Importamos aquí para evitar dependencia circular
  const { getClient, updateClientBalance } = await import("./clients");
  const { createTransaction } = await import("./transactions");

  try {
    // 1. Obtener recompensa
    const reward = await getReward(data.rewardId);
    if (!reward) {
      return { success: false, error: "Recompensa no encontrada" };
    }

    if (!reward.isActive) {
      return { success: false, error: "Esta recompensa ya no está disponible" };
    }

    // 2. Obtener cliente
    const client = await getClient(data.clientId);
    if (!client) {
      return { success: false, error: "Cliente no encontrado" };
    }

    // 3. Verificar balance
    if (client.balance < reward.cost) {
      return { success: false, error: "Saldo insuficiente" };
    }

    // 4. Descontar puntos
    const newBalance = client.balance - reward.cost;
    await updateClientBalance(data.clientId, newBalance);

    // 5. Crear transacción
    await createTransaction({
      establishmentId: data.establishmentId,
      clientId: data.clientId,
      type: "redeemed",
      amount: reward.cost,
      rewardId: data.rewardId,
      notes: `Canje: ${reward.name}`,
      createdBy: data.createdBy,
    });

    // 6. Incrementar contador
    await incrementRedemptionCount(data.rewardId);

    return { success: true };
  } catch (error) {
    console.error("Error redeeming reward:", error);
    return { success: false, error: "Error al procesar el canje" };
  }
};
