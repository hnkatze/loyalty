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
import type { Employee, EmployeeAvailability } from "@/types";

const COLLECTION = "employees";

const checkDb = () => {
  if (!db) {
    throw new Error("Firebase no está configurado. Verifica las variables de entorno.");
  }
  return db;
};

// Crear empleado
export const createEmployee = async (data: {
  establishmentId: string;
  name: string;
  phone?: string;
  email?: string;
  specialties?: string[];
  availability?: EmployeeAvailability;
}): Promise<string> => {
  const firestore = checkDb();

  // Construir objeto sin campos vacíos (Firestore no acepta undefined)
  const docData: Record<string, unknown> = {
    establishmentId: data.establishmentId,
    name: data.name,
    specialties: data.specialties || [],
    availability: data.availability || {},
    isActive: true,
    createdAt: serverTimestamp(),
  };

  // Solo agregar phone si tiene valor
  if (data.phone && data.phone.trim()) {
    docData.phone = data.phone.trim();
  }

  // Solo agregar email si tiene valor
  if (data.email && data.email.trim()) {
    docData.email = data.email.trim();
  }

  const docRef = await addDoc(collection(firestore, COLLECTION), docData);
  return docRef.id;
};

// Obtener empleado por ID
export const getEmployee = async (employeeId: string): Promise<Employee | null> => {
  const firestore = checkDb();
  const docRef = doc(firestore, COLLECTION, employeeId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
  } as Employee;
};

// Obtener empleados por establecimiento
export const getEmployeesByEstablishment = async (
  establishmentId: string
): Promise<Employee[]> => {
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
    } as Employee;
  });
};

// Obtener solo empleados activos
export const getActiveEmployees = async (
  establishmentId: string
): Promise<Employee[]> => {
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
    } as Employee;
  });
};

// Actualizar empleado
export const updateEmployee = async (
  employeeId: string,
  data: Partial<Omit<Employee, "id" | "createdAt" | "establishmentId">>
): Promise<void> => {
  const firestore = checkDb();
  const docRef = doc(firestore, COLLECTION, employeeId);

  // Filtrar campos vacíos y construir objeto de actualización
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.specialties !== undefined) updateData.specialties = data.specialties;
  if (data.availability !== undefined) updateData.availability = data.availability;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  // Para phone y email, si están vacíos los eliminamos del documento
  if (data.phone !== undefined) {
    if (data.phone && data.phone.trim()) {
      updateData.phone = data.phone.trim();
    } else {
      // Si está vacío, lo eliminamos usando deleteField sería ideal, pero podemos poner null
      updateData.phone = null;
    }
  }

  if (data.email !== undefined) {
    if (data.email && data.email.trim()) {
      updateData.email = data.email.trim();
    } else {
      updateData.email = null;
    }
  }

  await updateDoc(docRef, updateData);
};

// Actualizar disponibilidad del empleado
export const updateEmployeeAvailability = async (
  employeeId: string,
  availability: EmployeeAvailability
): Promise<void> => {
  const firestore = checkDb();
  const docRef = doc(firestore, COLLECTION, employeeId);
  await updateDoc(docRef, { availability });
};

// Eliminar empleado
export const deleteEmployee = async (employeeId: string): Promise<void> => {
  const firestore = checkDb();
  const docRef = doc(firestore, COLLECTION, employeeId);
  await deleteDoc(docRef);
};

// Obtener empleados que ofrecen un servicio específico
export const getEmployeesByService = async (
  establishmentId: string,
  serviceId: string
): Promise<Employee[]> => {
  const firestore = checkDb();
  const q = query(
    collection(firestore, COLLECTION),
    where("establishmentId", "==", establishmentId),
    where("isActive", "==", true),
    where("specialties", "array-contains", serviceId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Employee;
  });
};
