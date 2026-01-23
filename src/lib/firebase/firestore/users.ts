import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config";
import type { User, UserRole } from "@/types";

const COLLECTION = "users";

const checkDb = () => {
  if (!db) {
    throw new Error("Firebase no está configurado. Verifica las variables de entorno.");
  }
  return db;
};

export const createUser = async (
  userId: string,
  data: {
    email: string;
    name: string;
    role: UserRole;
    photoURL?: string;
    establishmentId?: string;
    phone?: string;
  }
): Promise<void> => {
  const firestore = checkDb();
  const userRef = doc(firestore, COLLECTION, userId);
  await setDoc(userRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getUser = async (userId: string): Promise<User | null> => {
  const firestore = checkDb();
  const userRef = doc(firestore, COLLECTION, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const data = userSnap.data();
  return {
    id: userSnap.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
  } as User;
};

export const updateUser = async (
  userId: string,
  data: Partial<Omit<User, "id" | "createdAt">>
): Promise<void> => {
  const firestore = checkDb();
  const userRef = doc(firestore, COLLECTION, userId);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const userExists = async (userId: string): Promise<boolean> => {
  const user = await getUser(userId);
  return user !== null;
};
