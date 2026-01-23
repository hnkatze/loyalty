"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User, Establishment, AuthContextType } from "@/types";
import {
  signInWithGoogle as firebaseSignInWithGoogle,
  signOut as firebaseSignOut,
  onAuthChange,
  FirebaseUser,
} from "@/lib/firebase";
import { getUser, createUser } from "@/lib/firebase/firestore/users";
import {
  createEstablishment,
  getTheEstablishment,
  hasEstablishment,
} from "@/lib/firebase/firestore/establishments";
import { createClient } from "@/lib/firebase/firestore/clients";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [pendingFirebaseUser, setPendingFirebaseUser] =
    useState<FirebaseUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setLoading(true);
      setError(null);

      if (firebaseUser) {
        try {
          // Verificar si el usuario ya existe
          const existingUser = await getUser(firebaseUser.uid);

          if (existingUser) {
            // Usuario existente
            setUser(existingUser);
            setPendingFirebaseUser(null);
            setNeedsSetup(false);

            // Cargar establecimiento
            const est = await getTheEstablishment();
            setEstablishment(est);
          } else {
            // Nuevo usuario - verificar si hay dueño
            const hasOwner = await hasEstablishment();
            setIsFirstUser(!hasOwner);
            setPendingFirebaseUser(firebaseUser);
            setNeedsSetup(true);
            setUser(null);

            // Si ya hay dueño, cargar el establecimiento para el cliente
            if (hasOwner) {
              const est = await getTheEstablishment();
              setEstablishment(est);
            }
          }
        } catch (err) {
          console.error("Error getting user:", err);
          setError("Error al obtener usuario");
        }
      } else {
        setUser(null);
        setEstablishment(null);
        setPendingFirebaseUser(null);
        setNeedsSetup(false);
        setIsFirstUser(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      await firebaseSignInWithGoogle();
    } catch (err) {
      console.error("Error signing in:", err);
      setError("Error al iniciar sesión con Google");
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut();
      setUser(null);
      setEstablishment(null);
      setPendingFirebaseUser(null);
      setNeedsSetup(false);
      setIsFirstUser(false);
      router.push("/");
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Error al cerrar sesión");
      throw err;
    }
  };

  // Primer usuario: completar setup como dueño
  const completeOwnerSetup = async (establishmentName: string) => {
    if (!pendingFirebaseUser) {
      throw new Error("No hay usuario pendiente de registro");
    }

    try {
      setError(null);

      // Crear establecimiento
      const establishmentId = await createEstablishment({
        ownerId: pendingFirebaseUser.uid,
        name: establishmentName,
        hours: {},
        currencyName: "Puntos",
        currencySymbol: "⭐",
      });

      // Crear usuario como dueño
      await createUser(pendingFirebaseUser.uid, {
        email: pendingFirebaseUser.email || "",
        name: pendingFirebaseUser.displayName || "",
        role: "owner",
        photoURL: pendingFirebaseUser.photoURL || undefined,
        establishmentId,
      });

      // Obtener datos creados
      const newUser = await getUser(pendingFirebaseUser.uid);
      const newEstablishment = await getTheEstablishment();

      setUser(newUser);
      setEstablishment(newEstablishment);
      setPendingFirebaseUser(null);
      setNeedsSetup(false);

      router.push("/owner/dashboard");
    } catch (err) {
      console.error("Error completing owner setup:", err);
      setError("Error al configurar el negocio");
      throw err;
    }
  };

  // Usuarios posteriores: completar setup como cliente
  const completeClientSetup = async (phone: string) => {
    if (!pendingFirebaseUser || !establishment) {
      throw new Error("No hay usuario o establecimiento");
    }

    try {
      setError(null);

      // Crear usuario como cliente
      await createUser(pendingFirebaseUser.uid, {
        email: pendingFirebaseUser.email || "",
        name: pendingFirebaseUser.displayName || "",
        role: "client",
        photoURL: pendingFirebaseUser.photoURL || undefined,
      });

      // Crear documento de cliente
      await createClient({
        userId: pendingFirebaseUser.uid,
        establishmentId: establishment.id,
        name: pendingFirebaseUser.displayName || "",
        email: pendingFirebaseUser.email || "",
        phone,
      });

      // Obtener usuario creado
      const newUser = await getUser(pendingFirebaseUser.uid);

      setUser(newUser);
      setPendingFirebaseUser(null);
      setNeedsSetup(false);

      router.push("/client/dashboard");
    } catch (err) {
      console.error("Error completing client setup:", err);
      setError("Error al completar el registro");
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        establishment,
        loading,
        error,
        needsSetup,
        isFirstUser,
        signInWithGoogle,
        signOut,
        completeOwnerSetup,
        completeClientSetup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
