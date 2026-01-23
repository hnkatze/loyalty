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
} from "firebase/firestore";
import { db } from "../config";
import type { Service } from "@/types";

const COLLECTION = "services";

const checkDb = () => {
  if (!db) {
    throw new Error("Firebase no está configurado. Verifica las variables de entorno.");
  }
  return db;
};

// Crear servicio
export const createService = async (data: {
  establishmentId: string;
  name: string;
  description?: string;
  duration: number;
  price?: number;
}): Promise<string> => {
  const firestore = checkDb();

  // Construir objeto sin campos undefined (Firestore no los acepta)
  const serviceData: Record<string, unknown> = {
    establishmentId: data.establishmentId,
    name: data.name,
    duration: data.duration,
    isActive: true,
    createdAt: serverTimestamp(),
  };

  if (data.description) {
    serviceData.description = data.description;
  }
  if (data.price !== undefined) {
    serviceData.price = data.price;
  }

  const docRef = await addDoc(collection(firestore, COLLECTION), serviceData);
  return docRef.id;
};

// Obtener servicio por ID
export const getService = async (serviceId: string): Promise<Service | null> => {
  const firestore = checkDb();
  const docRef = doc(firestore, COLLECTION, serviceId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
  } as Service;
};

// Obtener servicios por establecimiento
export const getServicesByEstablishment = async (
  establishmentId: string
): Promise<Service[]> => {
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
    } as Service;
  });
};

// Obtener solo servicios activos
export const getActiveServices = async (
  establishmentId: string
): Promise<Service[]> => {
  const firestore = checkDb();
  const q = query(
    collection(firestore, COLLECTION),
    where("establishmentId", "==", establishmentId),
    where("isActive", "==", true),
    orderBy("name", "asc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Service;
  });
};

// Actualizar servicio
export const updateService = async (
  serviceId: string,
  data: Partial<Omit<Service, "id" | "createdAt" | "establishmentId">>
): Promise<void> => {
  const firestore = checkDb();
  const docRef = doc(firestore, COLLECTION, serviceId);

  // Filtrar campos undefined (Firestore no los acepta)
  const cleanData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  }

  await updateDoc(docRef, cleanData);
};

// Eliminar servicio
export const deleteService = async (serviceId: string): Promise<void> => {
  const firestore = checkDb();
  const docRef = doc(firestore, COLLECTION, serviceId);
  await deleteDoc(docRef);
};

// Obtener múltiples servicios por IDs
export const getServicesByIds = async (
  serviceIds: string[]
): Promise<Service[]> => {
  if (serviceIds.length === 0) return [];

  const firestore = checkDb();
  const services: Service[] = [];

  for (const id of serviceIds) {
    const service = await getService(id);
    if (service) {
      services.push(service);
    }
  }

  return services;
};
