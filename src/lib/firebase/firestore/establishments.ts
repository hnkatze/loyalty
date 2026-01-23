import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config";
import type { Establishment } from "@/types";

const COLLECTION = "establishments";

const checkDb = () => {
  if (!db) {
    throw new Error("Firebase no está configurado. Verifica las variables de entorno.");
  }
  return db;
};

export const createEstablishment = async (
  data: Omit<Establishment, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const firestore = checkDb();
  const establishmentRef = doc(collection(firestore, COLLECTION));
  await setDoc(establishmentRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return establishmentRef.id;
};

export const getEstablishment = async (
  establishmentId: string
): Promise<Establishment | null> => {
  const firestore = checkDb();
  const establishmentRef = doc(firestore, COLLECTION, establishmentId);
  const establishmentSnap = await getDoc(establishmentRef);

  if (!establishmentSnap.exists()) return null;

  const data = establishmentSnap.data();
  return {
    id: establishmentSnap.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
  } as Establishment;
};

export const getEstablishmentByOwner = async (
  ownerId: string
): Promise<Establishment | null> => {
  const firestore = checkDb();
  const q = query(collection(firestore, COLLECTION), where("ownerId", "==", ownerId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;

  const docSnap = querySnapshot.docs[0];
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
  } as Establishment;
};

export const getAllEstablishments = async (): Promise<Establishment[]> => {
  const firestore = checkDb();
  const querySnapshot = await getDocs(collection(firestore, COLLECTION));
  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
    } as Establishment;
  });
};

export const updateEstablishment = async (
  establishmentId: string,
  data: Partial<Omit<Establishment, "id" | "createdAt">>
): Promise<void> => {
  const firestore = checkDb();
  const establishmentRef = doc(firestore, COLLECTION, establishmentId);
  await updateDoc(establishmentRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Verificar si ya existe un establecimiento (dueño) en el sistema
export const hasEstablishment = async (): Promise<boolean> => {
  const firestore = checkDb();
  const querySnapshot = await getDocs(collection(firestore, COLLECTION));
  return !querySnapshot.empty;
};

// Obtener el único establecimiento del sistema
export const getTheEstablishment = async (): Promise<Establishment | null> => {
  const firestore = checkDb();
  const querySnapshot = await getDocs(collection(firestore, COLLECTION));
  if (querySnapshot.empty) return null;

  const docSnap = querySnapshot.docs[0];
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
  } as Establishment;
};
