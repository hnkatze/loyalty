import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../config";
import { generateClientCode } from "@/lib/utils";
import type { Client } from "@/types";

const COLLECTION = "clients";

const checkDb = () => {
  if (!db) {
    throw new Error("Firebase no está configurado. Verifica las variables de entorno.");
  }
  return db;
};

export const createClient = async (
  data: Omit<Client, "id" | "createdAt" | "balance" | "code">
): Promise<string> => {
  const firestore = checkDb();

  // Generar código único
  let code = generateClientCode();
  let attempts = 0;
  while (attempts < 10) {
    const existing = await getClientByCode(data.establishmentId, code);
    if (!existing) break;
    code = generateClientCode();
    attempts++;
  }

  const clientRef = doc(collection(firestore, COLLECTION));
  await setDoc(clientRef, {
    ...data,
    code,
    balance: 0,
    createdAt: serverTimestamp(),
  });
  return clientRef.id;
};

export const getClient = async (clientId: string): Promise<Client | null> => {
  const firestore = checkDb();
  const clientRef = doc(firestore, COLLECTION, clientId);
  const clientSnap = await getDoc(clientRef);

  if (!clientSnap.exists()) return null;

  const data = clientSnap.data();
  return {
    id: clientSnap.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    lastVisit: data.lastVisit
      ? (data.lastVisit as Timestamp).toDate()
      : undefined,
  } as Client;
};

export const getClientByUserId = async (
  userId: string
): Promise<Client | null> => {
  const firestore = checkDb();
  const q = query(collection(firestore, COLLECTION), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;

  const docSnap = querySnapshot.docs[0];
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    lastVisit: data.lastVisit
      ? (data.lastVisit as Timestamp).toDate()
      : undefined,
  } as Client;
};

export const getClientsByEstablishment = async (
  establishmentId: string
): Promise<Client[]> => {
  const firestore = checkDb();
  const q = query(
    collection(firestore, COLLECTION),
    where("establishmentId", "==", establishmentId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      lastVisit: data.lastVisit
        ? (data.lastVisit as Timestamp).toDate()
        : undefined,
    } as Client;
  });
};

export const updateClientBalance = async (
  clientId: string,
  newBalance: number
): Promise<void> => {
  const firestore = checkDb();
  const clientRef = doc(firestore, COLLECTION, clientId);
  await updateDoc(clientRef, {
    balance: newBalance,
    lastVisit: serverTimestamp(),
  });
};

export const updateClient = async (
  clientId: string,
  data: Partial<Omit<Client, "id" | "createdAt">>
): Promise<void> => {
  const firestore = checkDb();
  const clientRef = doc(firestore, COLLECTION, clientId);
  await updateDoc(clientRef, data);
};

export const deleteClient = async (clientId: string): Promise<void> => {
  const firestore = checkDb();
  const clientRef = doc(firestore, COLLECTION, clientId);
  await deleteDoc(clientRef);
};

// Buscar cliente por código
export const getClientByCode = async (
  establishmentId: string,
  code: string
): Promise<Client | null> => {
  const firestore = checkDb();
  const normalizedCode = code.replace(/-/g, "").toUpperCase().trim();

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
    lastVisit: data.lastVisit
      ? (data.lastVisit as Timestamp).toDate()
      : undefined,
  } as Client;
};

// Buscar clientes por nombre, email, telefono o código
export const searchClients = async (
  establishmentId: string,
  searchQuery: string
): Promise<Client[]> => {
  // Firestore no soporta busqueda de texto completo,
  // asi que obtenemos todos los clientes y filtramos en memoria
  const clients = await getClientsByEstablishment(establishmentId);
  const searchTerm = searchQuery.toLowerCase().trim();
  const codeSearch = searchQuery.replace(/-/g, "").toUpperCase().trim();

  if (!searchTerm) return clients;

  return clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm) ||
      client.phone.includes(searchTerm) ||
      client.code === codeSearch ||
      client.code.includes(codeSearch)
  );
};

// Obtener clientes ordenados por balance (top clientes)
export const getTopClients = async (
  establishmentId: string,
  limit: number = 10
): Promise<Client[]> => {
  const firestore = checkDb();
  const q = query(
    collection(firestore, COLLECTION),
    where("establishmentId", "==", establishmentId),
    orderBy("balance", "desc")
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.slice(0, limit).map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      lastVisit: data.lastVisit
        ? (data.lastVisit as Timestamp).toDate()
        : undefined,
    } as Client;
  });
};
