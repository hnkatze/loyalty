import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  if (!auth) {
    throw new Error("Firebase no está configurado. Verifica las variables de entorno.");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signOut = async () => {
  if (!auth) {
    throw new Error("Firebase no está configurado.");
  }
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) {
    // Si no hay auth, devolver una función vacía
    console.warn("Firebase no está configurado. Auth state no estará disponible.");
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export type { FirebaseUser };
