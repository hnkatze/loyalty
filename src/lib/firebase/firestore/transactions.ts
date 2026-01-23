import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config";
import type { Transaction, TransactionType } from "@/types";

const COLLECTION = "transactions";

const checkDb = () => {
  if (!db) {
    throw new Error(
      "Firebase no está configurado. Verifica las variables de entorno."
    );
  }
  return db;
};

export const createTransaction = async (data: {
  establishmentId: string;
  clientId: string;
  type: TransactionType;
  amount: number;
  rewardId?: string;
  appointmentId?: string;
  notes?: string;
  createdBy: string;
}): Promise<string> => {
  const firestore = checkDb();

  // Filtrar campos undefined (Firestore no los acepta)
  const cleanData: Record<string, unknown> = {
    establishmentId: data.establishmentId,
    clientId: data.clientId,
    type: data.type,
    amount: data.amount,
    createdBy: data.createdBy,
    createdAt: serverTimestamp(),
  };

  if (data.rewardId) cleanData.rewardId = data.rewardId;
  if (data.appointmentId) cleanData.appointmentId = data.appointmentId;
  if (data.notes) cleanData.notes = data.notes;

  const docRef = await addDoc(collection(firestore, COLLECTION), cleanData);
  return docRef.id;
};

export const getTransaction = async (
  transactionId: string
): Promise<Transaction | null> => {
  const firestore = checkDb();
  const docRef = doc(firestore, COLLECTION, transactionId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
  } as Transaction;
};

export const getTransactionsByEstablishment = async (
  establishmentId: string
): Promise<Transaction[]> => {
  const firestore = checkDb();
  const q = query(
    collection(firestore, COLLECTION),
    where("establishmentId", "==", establishmentId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    } as Transaction;
  });
};

export const getTransactionsByClient = async (
  clientId: string
): Promise<Transaction[]> => {
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
    } as Transaction;
  });
};

// Obtener estadísticas del día actual
export const getTodayStats = async (
  establishmentId: string
): Promise<{
  pointsEarned: number;
  pointsRedeemed: number;
  transactionsCount: number;
}> => {
  const firestore = checkDb();

  // Calcular inicio y fin del día actual
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const q = query(
    collection(firestore, COLLECTION),
    where("establishmentId", "==", establishmentId),
    where("createdAt", ">=", Timestamp.fromDate(today)),
    where("createdAt", "<", Timestamp.fromDate(tomorrow))
  );

  const querySnapshot = await getDocs(q);

  let pointsEarned = 0;
  let pointsRedeemed = 0;

  querySnapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.type === "earned") {
      pointsEarned += data.amount;
    } else if (data.type === "redeemed") {
      pointsRedeemed += data.amount;
    }
  });

  return {
    pointsEarned,
    pointsRedeemed,
    transactionsCount: querySnapshot.size,
  };
};
